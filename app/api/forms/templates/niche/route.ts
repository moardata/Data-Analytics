/**
 * Niche-Specific Form Templates API
 * Provides pre-built survey templates for top Whop niches
 */

import { NextResponse } from 'next/server';

export interface NicheTemplate {
  id: string;
  niche: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'short_text' | 'long_text' | 'email' | 'number' | 'rating' | 'multiple_choice' | 'boolean';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
}

const NICHE_TEMPLATES: NicheTemplate[] = [
  // 1. Trading/Investing
  {
    id: 'trading',
    niche: 'Trading & Investing',
    name: 'Trading Community Feedback',
    description: 'Gather insights from your trading students about signals, strategies, and education quality',
    icon: '📈',
    color: '#10B981',
    fields: [
      {
        id: 'experience_level',
        label: 'What\'s your trading experience level?',
        type: 'multiple_choice',
        required: true,
        options: ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced', 'Professional']
      },
      {
        id: 'signal_quality',
        label: 'How would you rate the quality of our signals/calls?',
        type: 'rating',
        required: true
      },
      {
        id: 'win_rate',
        label: 'What\'s your approximate win rate since joining?',
        type: 'multiple_choice',
        required: false,
        options: ['Below 40%', '40-50%', '50-60%', '60-70%', '70%+', 'Not tracking yet']
      },
      {
        id: 'most_valuable',
        label: 'What aspect of the community is most valuable to you?',
        type: 'multiple_choice',
        required: true,
        options: ['Daily Signals', 'Educational Content', 'Community Support', 'Live Trading Sessions', 'Chart Analysis']
      },
      {
        id: 'improvement_areas',
        label: 'What would you like to see improved?',
        type: 'long_text',
        required: false,
        placeholder: 'Share your suggestions...'
      },
      {
        id: 'profitable',
        label: 'Have you been profitable since joining?',
        type: 'boolean',
        required: true
      },
      {
        id: 'recommend',
        label: 'Would you recommend us to other traders?',
        type: 'boolean',
        required: true
      }
    ]
  },

  // 2. E-commerce/Dropshipping
  {
    id: 'ecommerce',
    niche: 'E-commerce & Dropshipping',
    name: 'E-commerce Student Survey',
    description: 'Get feedback on your dropshipping course, product research, and store building guidance',
    icon: '🛍️',
    color: '#8B5CF6',
    fields: [
      {
        id: 'store_status',
        label: 'What\'s your current store status?',
        type: 'multiple_choice',
        required: true,
        options: ['Haven\'t started yet', 'Building my store', 'Launched but no sales', 'Making some sales', 'Profitable', 'Scaling']
      },
      {
        id: 'monthly_revenue',
        label: 'What\'s your approximate monthly revenue?',
        type: 'multiple_choice',
        required: false,
        options: ['$0', '$1-$1,000', '$1,000-$5,000', '$5,000-$10,000', '$10,000-$25,000', '$25,000+']
      },
      {
        id: 'product_research_rating',
        label: 'How helpful are our product research methods?',
        type: 'rating',
        required: true
      },
      {
        id: 'biggest_challenge',
        label: 'What\'s your biggest challenge right now?',
        type: 'multiple_choice',
        required: true,
        options: ['Finding winning products', 'Getting traffic', 'Converting sales', 'Scaling ads', 'Supplier issues', 'Store setup']
      },
      {
        id: 'support_quality',
        label: 'How would you rate our support and guidance?',
        type: 'rating',
        required: true
      },
      {
        id: 'additional_feedback',
        label: 'Any additional feedback or suggestions?',
        type: 'long_text',
        required: false,
        placeholder: 'Share your thoughts...'
      },
      {
        id: 'worth_investment',
        label: 'Do you feel the course was worth the investment?',
        type: 'boolean',
        required: true
      }
    ]
  },

  // 3. Sports Betting
  {
    id: 'sportsbetting',
    niche: 'Sports Betting',
    name: 'Sports Betting Community Survey',
    description: 'Collect feedback on picks accuracy, bankroll management education, and community value',
    icon: '🏈',
    color: '#F59E0B',
    fields: [
      {
        id: 'sports_followed',
        label: 'Which sports do you bet on? (Select main one)',
        type: 'multiple_choice',
        required: true,
        options: ['NFL', 'NBA', 'MLB', 'Soccer', 'UFC/MMA', 'Tennis', 'Multiple Sports']
      },
      {
        id: 'pick_accuracy',
        label: 'How would you rate our pick accuracy?',
        type: 'rating',
        required: true
      },
      {
        id: 'roi_performance',
        label: 'What\'s your ROI since following our picks?',
        type: 'multiple_choice',
        required: true,
        options: ['Negative (losing)', 'Break even', '1-10% profit', '10-25% profit', '25-50% profit', '50%+ profit']
      },
      {
        id: 'bankroll_education',
        label: 'How helpful is our bankroll management education?',
        type: 'rating',
        required: true
      },
      {
        id: 'most_valuable_service',
        label: 'What do you value most?',
        type: 'multiple_choice',
        required: true,
        options: ['Daily picks', 'In-depth analysis', 'Live betting advice', 'Bankroll strategy', 'Community discussion']
      },
      {
        id: 'improvement_suggestions',
        label: 'How can we improve?',
        type: 'long_text',
        required: false,
        placeholder: 'Share your suggestions...'
      },
      {
        id: 'profitable_member',
        label: 'Are you profitable following our guidance?',
        type: 'boolean',
        required: true
      }
    ]
  },

  // 4. Fitness/Personal Training
  {
    id: 'fitness',
    niche: 'Fitness & Training',
    name: 'Fitness Program Feedback',
    description: 'Track member progress, satisfaction with workouts, and nutrition guidance effectiveness',
    icon: '💪',
    color: '#EF4444',
    fields: [
      {
        id: 'fitness_goal',
        label: 'What\'s your primary fitness goal?',
        type: 'multiple_choice',
        required: true,
        options: ['Weight Loss', 'Muscle Building', 'Athletic Performance', 'General Fitness', 'Body Recomposition']
      },
      {
        id: 'program_rating',
        label: 'How would you rate the workout program?',
        type: 'rating',
        required: true
      },
      {
        id: 'progress_made',
        label: 'Have you made progress toward your goals?',
        type: 'multiple_choice',
        required: true,
        options: ['Significant progress', 'Some progress', 'Minimal progress', 'No progress yet', 'Just started']
      },
      {
        id: 'nutrition_guidance_rating',
        label: 'How helpful is the nutrition guidance?',
        type: 'rating',
        required: true
      },
      {
        id: 'workout_difficulty',
        label: 'How do you find the workout difficulty?',
        type: 'multiple_choice',
        required: true,
        options: ['Too easy', 'Slightly easy', 'Just right', 'Slightly challenging', 'Too challenging']
      },
      {
        id: 'favorite_aspect',
        label: 'What\'s your favorite part of the program?',
        type: 'long_text',
        required: false,
        placeholder: 'Tell us what you love...'
      },
      {
        id: 'accountability_helpful',
        label: 'Is the community accountability helpful?',
        type: 'boolean',
        required: true
      },
      {
        id: 'seeing_results',
        label: 'Are you seeing physical results?',
        type: 'boolean',
        required: true
      }
    ]
  },

  // 5. Digital Marketing
  {
    id: 'marketing',
    niche: 'Digital Marketing',
    name: 'Marketing Course Feedback',
    description: 'Evaluate your marketing education effectiveness and student campaign results',
    icon: '📱',
    color: '#3B82F6',
    fields: [
      {
        id: 'marketing_focus',
        label: 'What\'s your primary marketing focus?',
        type: 'multiple_choice',
        required: true,
        options: ['Social Media Marketing', 'Email Marketing', 'SEO', 'Paid Ads (FB/Google)', 'Content Marketing', 'Affiliate Marketing']
      },
      {
        id: 'course_content_rating',
        label: 'How would you rate the course content quality?',
        type: 'rating',
        required: true
      },
      {
        id: 'implementation_success',
        label: 'Have you successfully implemented the strategies?',
        type: 'multiple_choice',
        required: true,
        options: ['Not yet started', 'Working on it', 'Partially implemented', 'Fully implemented', 'Scaled beyond']
      },
      {
        id: 'client_results',
        label: 'Are you getting results for clients (or yourself)?',
        type: 'boolean',
        required: true
      },
      {
        id: 'roi_achieved',
        label: 'Have you achieved positive ROI on campaigns?',
        type: 'boolean',
        required: true
      },
      {
        id: 'support_responsiveness',
        label: 'How responsive is our support team?',
        type: 'rating',
        required: true
      },
      {
        id: 'improvement_areas',
        label: 'What topics should we cover more?',
        type: 'long_text',
        required: false,
        placeholder: 'Suggest topics or improvements...'
      }
    ]
  },

  // 6. Content Creation
  {
    id: 'content',
    niche: 'Content Creation',
    name: 'Creator Community Survey',
    description: 'Get feedback from aspiring YouTubers, TikTokers, and content creators',
    icon: '🎥',
    color: '#EC4899',
    fields: [
      {
        id: 'platform',
        label: 'Which platform are you focusing on?',
        type: 'multiple_choice',
        required: true,
        options: ['YouTube', 'TikTok', 'Instagram', 'Twitch', 'Multiple Platforms']
      },
      {
        id: 'current_subscribers',
        label: 'What\'s your current following size?',
        type: 'multiple_choice',
        required: true,
        options: ['0-1K', '1K-10K', '10K-50K', '50K-100K', '100K-500K', '500K+']
      },
      {
        id: 'growth_since_joining',
        label: 'How much have you grown since joining?',
        type: 'multiple_choice',
        required: true,
        options: ['Just started', 'Minimal growth', 'Steady growth', 'Significant growth', 'Explosive growth']
      },
      {
        id: 'strategy_rating',
        label: 'How effective are our growth strategies?',
        type: 'rating',
        required: true
      },
      {
        id: 'monetization_status',
        label: 'Have you started monetizing your content?',
        type: 'boolean',
        required: true
      },
      {
        id: 'most_helpful_resource',
        label: 'What\'s been most helpful?',
        type: 'multiple_choice',
        required: true,
        options: ['Content ideas/scripts', 'Editing tutorials', 'Algorithm tips', 'Monetization strategies', 'Community feedback']
      },
      {
        id: 'additional_feedback',
        label: 'Any suggestions or feedback?',
        type: 'long_text',
        required: false,
        placeholder: 'Share your thoughts...'
      }
    ]
  },

  // 7. Software Development
  {
    id: 'coding',
    niche: 'Software Development',
    name: 'Coding Course Survey',
    description: 'Assess programming course effectiveness and student skill development',
    icon: '💻',
    color: '#06B6D4',
    fields: [
      {
        id: 'experience_level',
        label: 'What\'s your coding experience?',
        type: 'multiple_choice',
        required: true,
        options: ['Complete beginner', 'Some basics', 'Intermediate', 'Advanced', 'Professional developer']
      },
      {
        id: 'learning_path',
        label: 'Which path are you following?',
        type: 'multiple_choice',
        required: true,
        options: ['Web Development', 'Mobile Development', 'Data Science/AI', 'Game Development', 'Backend/APIs', 'DevOps']
      },
      {
        id: 'content_difficulty',
        label: 'How do you find the course difficulty?',
        type: 'multiple_choice',
        required: true,
        options: ['Too easy', 'Just right', 'Challenging but manageable', 'Too difficult', 'Varies by topic']
      },
      {
        id: 'instruction_quality',
        label: 'How would you rate the instruction quality?',
        type: 'rating',
        required: true
      },
      {
        id: 'projects_completed',
        label: 'Have you completed any real projects?',
        type: 'boolean',
        required: true
      },
      {
        id: 'job_ready',
        label: 'Do you feel job-ready or closer to your goals?',
        type: 'multiple_choice',
        required: true,
        options: ['Not yet', 'Getting there', 'Almost ready', 'Ready to apply', 'Already got a job/clients']
      },
      {
        id: 'improvement_suggestions',
        label: 'What would help you learn better?',
        type: 'long_text',
        required: false,
        placeholder: 'Suggest improvements...'
      }
    ]
  },

  // 8. Gaming/Esports
  {
    id: 'gaming',
    niche: 'Gaming & Esports',
    name: 'Gaming Community Feedback',
    description: 'Get feedback on coaching quality, skill improvement, and community engagement',
    icon: '🎮',
    color: '#A855F7',
    fields: [
      {
        id: 'game_title',
        label: 'Which game are you primarily playing?',
        type: 'short_text',
        required: true,
        placeholder: 'e.g., Valorant, League of Legends...'
      },
      {
        id: 'current_rank',
        label: 'What\'s your current rank/rating?',
        type: 'short_text',
        required: true,
        placeholder: 'e.g., Platinum, 2500 MMR...'
      },
      {
        id: 'rank_improvement',
        label: 'Have you improved your rank since joining?',
        type: 'multiple_choice',
        required: true,
        options: ['Significantly improved', 'Improved somewhat', 'Stayed the same', 'Need more time', 'Just joined']
      },
      {
        id: 'coaching_quality',
        label: 'How would you rate the coaching quality?',
        type: 'rating',
        required: true
      },
      {
        id: 'most_valuable',
        label: 'What\'s most valuable to you?',
        type: 'multiple_choice',
        required: true,
        options: ['VOD Reviews', 'Live coaching', 'Strategy guides', 'Community scrims', 'Mental game coaching']
      },
      {
        id: 'skills_improved',
        label: 'Which skills have improved most?',
        type: 'long_text',
        required: false,
        placeholder: 'e.g., aim, game sense, positioning...'
      },
      {
        id: 'worth_it',
        label: 'Has the coaching been worth it?',
        type: 'boolean',
        required: true
      }
    ]
  },

  // 9. Real Estate
  {
    id: 'realestate',
    niche: 'Real Estate Investing',
    name: 'Real Estate Course Survey',
    description: 'Track student progress in real estate investing education and deal success',
    icon: '🏘️',
    color: '#14B8A6',
    fields: [
      {
        id: 'investment_focus',
        label: 'What\'s your real estate focus?',
        type: 'multiple_choice',
        required: true,
        options: ['Wholesaling', 'Fix & Flip', 'Buy & Hold Rentals', 'STR/Airbnb', 'Commercial', 'Land', 'Multiple strategies']
      },
      {
        id: 'deals_completed',
        label: 'How many deals have you completed?',
        type: 'multiple_choice',
        required: true,
        options: ['None yet', '1-2 deals', '3-5 deals', '6-10 deals', '10+ deals']
      },
      {
        id: 'education_quality',
        label: 'How would you rate the education quality?',
        type: 'rating',
        required: true
      },
      {
        id: 'deal_finding',
        label: 'Are our deal-finding strategies working for you?',
        type: 'boolean',
        required: true
      },
      {
        id: 'funding_clarity',
        label: 'How clear is our funding/financing guidance?',
        type: 'rating',
        required: true
      },
      {
        id: 'biggest_challenge',
        label: 'What\'s your biggest challenge?',
        type: 'multiple_choice',
        required: true,
        options: ['Finding deals', 'Analyzing deals', 'Funding/Capital', 'Building team', 'Closing deals', 'Scaling']
      },
      {
        id: 'additional_support_needed',
        label: 'What additional support would help?',
        type: 'long_text',
        required: false,
        placeholder: 'Share what would help you succeed...'
      }
    ]
  },

  // 10. Business/Entrepreneurship
  {
    id: 'business',
    niche: 'Business Consulting',
    name: 'Entrepreneur Community Survey',
    description: 'Gather feedback on business consulting, mindset coaching, and implementation success',
    icon: '💼',
    color: '#F97316',
    fields: [
      {
        id: 'business_stage',
        label: 'What stage is your business in?',
        type: 'multiple_choice',
        required: true,
        options: ['Idea stage', 'Just started (0-6 months)', 'Growing (6-24 months)', 'Established (2+ years)', 'Scaling']
      },
      {
        id: 'monthly_revenue',
        label: 'What\'s your approximate monthly revenue?',
        type: 'multiple_choice',
        required: false,
        options: ['$0', '$1-$5K', '$5K-$10K', '$10K-$25K', '$25K-$50K', '$50K-$100K', '$100K+']
      },
      {
        id: 'consulting_value',
        label: 'How valuable is the consulting/mentorship?',
        type: 'rating',
        required: true
      },
      {
        id: 'implemented_strategies',
        label: 'Have you implemented the strategies taught?',
        type: 'multiple_choice',
        required: true,
        options: ['Not yet', 'Partially', 'Most of them', 'All of them', 'Beyond - created my own']
      },
      {
        id: 'revenue_growth',
        label: 'Have you grown revenue since joining?',
        type: 'boolean',
        required: true
      },
      {
        id: 'most_impactful',
        label: 'What\'s been most impactful?',
        type: 'multiple_choice',
        required: true,
        options: ['Sales strategies', 'Marketing tactics', 'Mindset coaching', 'Systems/processes', 'Accountability']
      },
      {
        id: 'areas_to_cover',
        label: 'What topics should we cover more?',
        type: 'long_text',
        required: false,
        placeholder: 'Suggest additional topics...'
      },
      {
        id: 'recommend',
        label: 'Would you recommend us to other entrepreneurs?',
        type: 'boolean',
        required: true
      }
    ]
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    templates: NICHE_TEMPLATES,
    count: NICHE_TEMPLATES.length
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nicheId } = body;

    const template = NICHE_TEMPLATES.find(t => t.id === nicheId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

