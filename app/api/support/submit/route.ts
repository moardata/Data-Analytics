/**
 * Support & Feedback Submission API
 * Handles feedback and support ticket submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, type, subject, message, userEmail, userName } = body;

    console.log('📧 [Support API] Received submission:', {
      type,
      subject,
      hasMessage: !!message,
      companyId
    });

    if (!subject || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client record
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, email, name, company_id')
      .eq('company_id', companyId)
      .single();

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Store in database
    const { data: ticket, error: dbError } = await supabase
      .from('support_tickets')
      .insert({
        client_id: clientData.id,
        ticket_type: type,
        subject,
        message,
        user_email: userEmail || clientData.email,
        user_name: userName || clientData.name || 'Unknown User',
        status: 'open',
        priority: type === 'bug' ? 'high' : 'normal',
        metadata: {
          company_id: companyId,
          submitted_via: 'settings_page'
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ [Support API] Database error:', dbError);
      throw dbError;
    }

    console.log('✅ [Support API] Ticket created:', ticket.id);

    // Send email notification
    try {
      const emailData = {
        from: process.env.RESEND_FROM_EMAIL || 'CreatorIQ <onboarding@resend.dev>',
        to: process.env.SUPPORT_EMAIL || clientData.email,
        subject: `[${type.toUpperCase()}] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">New ${type === 'feedback' ? 'Feedback' : 'Support Request'}</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>From:</strong> ${userName || clientData.name || 'Unknown'} (${userEmail || clientData.email})</p>
              <p><strong>Company ID:</strong> ${companyId}</p>
              <p><strong>Ticket ID:</strong> ${ticket.id}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <h3 style="color: #333;">Subject:</h3>
            <p style="font-size: 16px; color: #666;">${subject}</p>

            <h3 style="color: #333;">Message:</h3>
            <div style="background: white; padding: 20px; border-left: 4px solid #10B981; white-space: pre-wrap;">
${message}
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="color: #999; font-size: 12px;">
              This is an automated notification from CreatorIQ.
            </p>
          </div>
        `,
      };

      if (process.env.RESEND_API_KEY) {
        const { data: emailResponse, error: emailError } = await resend.emails.send(emailData);

        if (emailError) {
          console.error('⚠️ [Support API] Email send failed:', emailError);
          // Don't fail the request if email fails
        } else {
          console.log('✅ [Support API] Email sent:', emailResponse?.id);
        }
      } else {
        console.log('⚠️ [Support API] Resend API key not configured, skipping email');
      }
    } catch (emailError) {
      console.error('⚠️ [Support API] Email error:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        type: ticket.ticket_type,
        status: ticket.status
      }
    });

  } catch (error: any) {
    console.error('❌ [Support API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit request',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

