'use client';
import React, { forwardRef } from 'react';
import Image from 'next/image';
import { TracingBeam } from './ui/tracing-beam';

type RevealedContentProps = React.PropsWithChildren<object>;

const content = [
	{
		image: '/images/dashboard.png',
		title: 'Awesome Trip Dashboard',
		description: 'Create, customize and manage your trips all in one place.',
		badge: 'Dashboard',
	},
	{
		image: '/images/create-trip.png',
		title: 'Explore Vibrant Cultures',
		description: 'Immerse yourself in traditions, food, and breathtaking experiences.',
		badge: 'Trip',
	},
	{
		image: '/images/itinerary.png',
		title: 'Craft Your Perfect Itinerary',
		description: 'Plan your dream trip with our AI integrated itinerary planner.',
		badge: 'Itinerary',
	},
];

const RevealedContent = forwardRef<HTMLElement, RevealedContentProps>((props, ref) => {
	return (
		<section
			ref={ref}
			className="absolute h-[250vh] inset-0 z-[2] bg-[var(--color-bg)] text-[var(--color-primary)] [clip-path:circle(0%_at_50%_50%)] flex flex-col items-center justify-center py-40 "
		>
			<TracingBeam className="max-w-6xl px-6 revealed-fade">
				<div className="mx-auto w-full">
					{content.map((item, index) => (
						<div
  key={index}
  className="mb-16 flex flex-col md:flex-row items-start gap-8"
>
  {/* Content (left side) */}
  <div className="flex-1">
    <span className="inline-block px-4 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-white mb-4">
      {item.badge}
    </span>

    <h3 className="text-2xl md:text-3xl font-bold mb-4">{item.title}</h3>

    <p className="text-sm md:text-base text-zinc-400 max-w-xl">
      {item.description}
    </p>
  </div>

  {/* Image (right side) */}
  <div className="relative w-full md:w-[50%] h-[250px] md:h-[300px] rounded-xl overflow-hidden shadow-lg revealed-img">
    <Image
      src={item.image}
      alt={item.title}
      fill
      className="object-contain rounded-xl"
    />
  </div>
</div>

					))}
				</div>
			</TracingBeam>
		</section>
	);
});

RevealedContent.displayName = 'RevealedContent';
export default RevealedContent;
