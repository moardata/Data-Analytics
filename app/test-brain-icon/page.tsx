/**
 * Test page to verify brain icon is rendering correctly
 */

'use client';

import { BrainMicrochipIcon } from '@/components/icons/BrainMicrochipIcon';

export default function TestBrainIconPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Brain Icon Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test 1: Default size */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Default Size (h-5 w-5)</h2>
            <div className="flex items-center gap-4">
              <BrainMicrochipIcon className="h-5 w-5 text-white" />
              <span className="text-gray-300">Brain in Microchip Icon</span>
            </div>
          </div>

          {/* Test 2: Large size */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Large Size (h-8 w-8)</h2>
            <div className="flex items-center gap-4">
              <BrainMicrochipIcon className="h-8 w-8 text-white" />
              <span className="text-gray-300">Brain in Microchip Icon</span>
            </div>
          </div>

          {/* Test 3: Green color */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Green Color</h2>
            <div className="flex items-center gap-4">
              <BrainMicrochipIcon className="h-6 w-6 text-[#10B981]" />
              <span className="text-gray-300">Brain in Microchip Icon</span>
            </div>
          </div>

          {/* Test 4: Multiple sizes */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Multiple Sizes</h2>
            <div className="flex items-center gap-4">
              <BrainMicrochipIcon className="h-4 w-4 text-white" />
              <BrainMicrochipIcon className="h-6 w-6 text-white" />
              <BrainMicrochipIcon className="h-8 w-8 text-white" />
              <BrainMicrochipIcon className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Icon Details</h2>
          <div className="text-gray-300 space-y-2">
            <p>• Brain outline with thick stroke (3px)</p>
            <p>• Microchip border with 20 pins</p>
            <p>• Transparent background</p>
            <p>• Scalable vector graphics</p>
            <p>• Current color support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
