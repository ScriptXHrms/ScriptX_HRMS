import React from 'react';
import { ArrowRight } from 'lucide-react';
import person1 from '../assets/Person_1.jpeg';
import person3 from '../assets/Person_3.png';
import person4 from '../assets/Person_4.png';

export default function LaneBlog({ onSeeAll }) {
  // Mapped according to user request:
  // Card 1 marked '1' -> Person_1.jpeg
  // Card 2 marked '4' -> Person_4.png
  // Card 3 marked '3' -> Person_3.png
  const articles = [
    {
      id: 1,
      image: person1,
      date: 'July 10, 2025',
      title: 'Insights & Strategies for Building Your Personal Brand',
      description: 'Learn how to craft a consistent tone that reflects your values and builds trust with your audience.'
    },
    {
      id: 2,
      image: person4,
      date: 'June 28, 2025',
      title: 'Optimizing Your LinkedIn Profile in 2025',
      description: "Your profile is your first impression—here's how to make it powerful, professional, and searchable."
    },
    {
      id: 3,
      image: person3,
      date: 'July 2, 2025',
      title: 'Why Content is the Currency of Personal Branding',
      description: 'Discover how valuable, authentic content can position you as an authority in your field.'
    }
  ];

  return (
    <section id="blog" className="py-20 sm:py-28 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold text-neutral-400 tracking-wider mb-3">
            Our Blog
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight leading-[1.12] mb-4 font-sans">
            Insights & Strategies for Building <br />
            <span className="text-[#703BF7]">Your Personal Brand</span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-lg mx-auto">
            Actionable tips, expert advice, and real-life lessons to help you grow your influence, authority, and visibility—one post at a time.
          </p>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-14">
          {articles.map((item) => (
            <article
              key={item.id}
              className="group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Article Image */}
                <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-neutral-100 mb-4 shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Article Date */}
                <div className="text-[11px] font-medium text-neutral-400 mb-1.5 font-mono">
                  {item.date}
                </div>

                {/* Article Title */}
                <h3 className="font-bold text-base sm:text-lg text-neutral-900 group-hover:text-[#703BF7] transition-colors leading-snug mb-2 font-sans">
                  {item.title}
                </h3>

                {/* Article Description */}
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Center See All Articles Button */}
        <div className="text-center">
          <button
            onClick={onSeeAll}
            className="btn-lane-primary group rounded-full pl-6 pr-2.5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-4 cursor-pointer shadow-md shadow-[#703BF7]/25"
          >
            <span>See All Articles</span>
            <div className="w-8 h-8 rounded-full bg-white text-[#703BF7] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-xs">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}
