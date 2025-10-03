"use client";
import { ReactNode } from 'react';
import { cn } from '@/utils/lib';
import { ArrowRight } from 'lucide-react'
interface PostItProps {
  children: ReactNode;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'zine-yellow' | 'zine-blue' | 'zine-green';
  rotation?: number;
  hoverRotation?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses = {
  yellow: 'bg-yellow-200 border-yellow-300',
  pink: 'bg-pink-200 border-pink-300',
  blue: 'bg-blue-200 border-blue-300',
  green: 'bg-green-200 border-green-300',
  orange: 'bg-orange-200 border-orange-300',
  'zine-yellow': 'bg-zine-yellow border-none',
  'zine-blue': 'bg-zine-blue border-none', 
  'zine-green': 'bg-zine-green border-none',
};

const sizeClasses = {
  sm: 'p-2 text-xs max-w-xs',
  md: 'p-3 text-sm max-w-sm',
  lg: 'p-4 text-base max-w-md',
};

export function PostIt({ 
  children, 
  color = 'yellow', 
  rotation = -3, 
  hoverRotation = 6,
  size = 'sm',
  className = '' 
}: PostItProps) {
  return (
    <div 
      className={cn(
        // Base post-it styling
        "relative border-2 transition-all duration-300 cursor-pointer",
        // Color scheme
        colorClasses[color],
        // Size
        sizeClasses[size],
        className
      )}
      style={{
        background: color.startsWith('zine-') ? undefined : 
          `linear-gradient(135deg, ${color === 'yellow' ? '#fef3c7' : 
                     color === 'pink' ? '#fce7f3' : 
                     color === 'blue' ? '#dbeafe' :
                     color === 'green' ? '#d1fae5' : '#fed7aa'} 0%, 
                     ${color === 'yellow' ? '#fde68a' : 
                     color === 'pink' ? '#f9a8d4' : 
                     color === 'blue' ? '#93c5fd' :
                     color === 'green' ? '#6ee7b7' : '#fdba74'} 100%)`
      }}
    >
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
      
      {/* Content */}
      <div className="relative z-10 font-mono leading-tight">
        {children}
      </div>
      
      {/* Bottom right corner fold */}
      <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[12px] border-b-[12px] border-l-transparent border-b-gray-300 opacity-20"></div>
    </div>
  );
}

export function PostItNote({ title, content, className }: { title: string; content: string; className?: string }) {
  return (
    <PostIt className={className}>
      <div>
        <p className="font-bold text-xs mb-1">{title}</p>
        <p className="text-xs opacity-80">{content}</p>
      </div>
    </PostIt>
  );
}

export function PostItZineInfo({ 
  title, 
  authors, 
  slug, 
  color = 'yellow',
  className 
}: { 
  title: string; 
  authors: string; 
  slug: string; 
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'zine-yellow' | 'zine-blue' | 'zine-green';
  className?: string;
}) {
  return (
    <PostIt color={color} size="sm" className={className}>
      <div>
        <p className="font-bold text-xs mb-1">{title}</p>
        <p className="text-xs opacity-80 mb-1">por {authors}</p>
        <a 
          href={`/zines/${slug}`} 
          className="text-xs underline text-zine-darkblue hover:opacity-80 transition-colors duration-200"
        >
           ver zine
          <ArrowRight className="inline w-3 h-3 mb-0.5" />
        </a>
      </div>
    </PostIt>
  );
}
