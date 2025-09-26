'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/ui/ParticleBackground';

// Command category component
const CommandCategory = ({ 
  name, 
  active = false,
  onClick
}: { 
  name: string;
  active?: boolean;
  onClick: () => void;
}) => {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active 
          ? 'bg-white text-black' 
          : 'bg-white bg-opacity-5 hover:bg-opacity-10'
      }`}
    >
      {name}
    </button>
  );
};

// Command card component
const CommandCard = ({ 
  command, 
  description, 
  example, 
  onClick
}: { 
  command: string; 
  description: string; 
  example: string;
  onClick: () => void;
}) => {
  return (
    <div 
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 hover:bg-opacity-10 transition cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-xl font-bold mb-2">{command}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <div className="bg-black bg-opacity-50 p-3 rounded-lg font-mono text-sm overflow-x-auto">
        <code>{example}</code>
      </div>
    </div>
  );
};

// Command explorer component
const CommandExplorer = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [commandOutput, setCommandOutput] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const categories = ['All', 'Text', 'Code', 'Data', 'System', 'Web', 'Custom'];
  
  const commands = [
    {
      command: "summarize",
      category: "Text",
      description: "Summarize text content into a concise format",
      example: "summarize [text or selected content]",
      handler: (input: string) => {
        return `Summary of "${input}":\n\nThis is a concise summary of the provided text, highlighting the key points while maintaining the core message. The summary is approximately 25% of the original length.`;
      }
    },
    {
      command: "explain-code",
      category: "Code",
      description: "Explain what a piece of code does in plain language",
      example: "explain-code [code snippet]",
      handler: (input: string) => {
        return `Explanation:\n\nThis code ${input.includes('function') ? 'defines a function that' : 'is a script that'} performs a specific task. It uses ${input.includes('for') || input.includes('while') ? 'loops' : 'statements'} to process data and ${input.includes('return') ? 'returns a result' : 'produces output'}.`;
      }
    },
    {
      command: "analyze-data",
      category: "Data",
      description: "Analyze data and provide insights",
      example: "analyze-data [csv data or dataset name]",
      handler: (input: string) => {
        return `Data Analysis Results:\n\n• Dataset contains approximately ${Math.floor(Math.random() * 1000) + 100} records\n• Key metrics identified: Average, Median, Standard Deviation\n• Potential correlations detected between variables\n• Anomalies detected: ${Math.floor(Math.random() * 10)} outliers identified`;
      }
    },
    {
      command: "system-info",
      category: "System",
      description: "Display system information and resource usage",
      example: "system-info",
      handler: () => {
        return `System Information:\n\n• CPU: 4 cores, 35% utilization\n• Memory: 8GB total, 3.2GB used (40%)\n• Disk: 256GB total, 120GB free\n• Network: Connected, 15Mbps download, 5Mbps upload\n• Operating System: ${Math.random() > 0.5 ? 'Windows 11' : 'macOS Ventura'}`;
      }
    },
    {
      command: "search-web",
      category: "Web",
      description: "Search the web for information",
      example: "search-web [query]",
      handler: (input: string) => {
        return `Web Search Results for "${input}":\n\n1. ${input} - Official Documentation\n2. Understanding ${input}: A Complete Guide\n3. How to Use ${input} Effectively\n4. ${input} vs Alternatives: A Comparison\n5. Latest News About ${input}`;
      }
    },
    {
      command: "create-schedule",
      category: "Custom",
      description: "Create a schedule or timetable based on inputs",
      example: "create-schedule [events and times]",
      handler: (input: string) => {
        return `Generated Schedule:\n\n9:00 AM - Morning Review\n10:30 AM - Meeting with Team\n12:00 PM - Lunch Break\n1:30 PM - Work on ${input}\n3:00 PM - Check Emails\n4:30 PM - Planning for Tomorrow\n5:30 PM - End of Day`;
      }
    },
    {
      command: "translate",
      category: "Text",
      description: "Translate text to another language",
      example: "translate [text] to [language]",
      handler: (input: string) => {
        const targetLang = input.includes('to ') ? input.split('to ').pop() : 'Spanish';
        return `Translation to ${targetLang}:\n\n[Translated text would appear here in ${targetLang}]`;
      }
    },
    {
      command: "generate-code",
      category: "Code",
      description: "Generate code based on a description",
      example: "generate-code [description]",
      handler: (input: string) => {
        return `Generated Code:\n\n\`\`\`javascript\n// Function to ${input}\nfunction processData(input) {\n  // Parse the input\n  const data = JSON.parse(input);\n  \n  // Process the data\n  const result = data.map(item => {\n    return {\n      id: item.id,\n      value: item.value * 2,\n      processed: true\n    };\n  });\n  \n  return result;\n}\n\`\`\``;
      }
    }
  ];
  
  const filteredCommands = commands.filter(cmd => {
    const matchesCategory = activeCategory === 'All' || cmd.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCommandSelect = (command: string) => {
    setCurrentCommand(command);
    setCommandInput('');
    setCommandOutput(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCommandSubmit = () => {
    if (!currentCommand || !commandInput.trim()) return;
    
    setIsProcessing(true);
    
    // Find the selected command
    const selectedCommand = commands.find(cmd => cmd.command === currentCommand);
    
    // Simulate processing delay
    setTimeout(() => {
      if (selectedCommand) {
        setCommandOutput(selectedCommand.handler(commandInput));
      } else {
        setCommandOutput(`Command "${currentCommand}" executed with input: ${commandInput}`);
      }
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Command Explorer</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Discover and test Control AI commands to see how they can enhance your workflow.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Command list panel */}
        <div className="lg:col-span-1">
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 sticky top-24">
            <div className="mb-6">
              <input 
                type="text" 
                placeholder="Search commands..." 
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category, index) => (
                <CommandCategory 
                  key={index} 
                  name={category} 
                  active={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {filteredCommands.map((cmd, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    currentCommand === cmd.command 
                      ? 'bg-white bg-opacity-20' 
                      : 'hover:bg-white hover:bg-opacity-10'
                  }`}
                  onClick={() => handleCommandSelect(cmd.command)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{cmd.command}</h3>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-10 rounded-full">{cmd.category}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{cmd.description}</p>
                </div>
              ))}
              
              {filteredCommands.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No commands found matching your criteria
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Command playground panel */}
        <div className="lg:col-span-2">
          {currentCommand ? (
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">{currentCommand}</h2>
              <p className="text-gray-300 mb-6">
                {commands.find(cmd => cmd.command === currentCommand)?.description}
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Example:</label>
                <div className="bg-black bg-opacity-50 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                  <code>{commands.find(cmd => cmd.command === currentCommand)?.example}</code>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Input:</label>
                <div className="flex">
                  <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="Enter your command input..." 
                    className="flex-grow bg-white bg-opacity-10 border border-white border-opacity-20 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommandSubmit()}
                  />
                  <button 
                    className="bg-white text-black px-6 py-3 rounded-r-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCommandSubmit}
                    disabled={isProcessing || !commandInput.trim()}
                  >
                    {isProcessing ? 'Processing...' : 'Execute'}
                  </button>
                </div>
              </div>
              
              {commandOutput && (
                <div>
                  <label className="block text-sm font-medium mb-2">Output:</label>
                  <div className="bg-black bg-opacity-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                    {commandOutput}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-8 flex flex-col items-center justify-center h-full">
              <div className="text-6xl mb-4">👈</div>
              <h3 className="text-xl font-bold mb-2">Select a Command</h3>
              <p className="text-gray-300 text-center">
                Choose a command from the list to explore its functionality and try it out.
              </p>
            </div>
          )}
          
          <div className="mt-8 bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">About Command Explorer</h3>
            <p className="text-gray-300 mb-4">
              This interactive playground allows you to explore and test Control AI commands in your browser. 
              These are the same commands available in the desktop application, but running in a simulated environment.
            </p>
            <p className="text-gray-300">
              For the full experience with system integration and access to all features, 
              <a href="/downloads" className="text-white hover:underline"> download the Control AI desktop application</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CommandExplorerPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <CommandExplorer />
    </main>
  );
}