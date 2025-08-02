'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    delay: number;
}

const roadmapSteps: RoadmapStep[] = [
    {
        id: 'brands-create',
        title: 'Brands Create Gigs',
        description: 'Brands post creative projects and opportunities',
        icon: '🏢',
        color: 'bg-blue-500',
        delay: 0
    },
    {
        id: 'influencers-apply',
        title: 'Influencers Apply',
        description: 'Influencers discover and apply for gigs',
        icon: '📱',
        color: 'bg-purple-500',
        delay: 0.2
    },
    {
        id: 'brands-approve',
        title: 'Brands Approve',
        description: 'Brands review and approve applications',
        icon: '✅',
        color: 'bg-green-500',
        delay: 0.4
    },
    {
        id: 'collaborate-crew',
        title: 'Collaborate',
        description: 'Influencers team up with crew via clans',
        icon: '👥',
        color: 'bg-orange-500',
        delay: 0.6
    },
    {
        id: 'finish-project',
        title: 'Complete Project',
        description: 'Team delivers high-quality work',
        icon: '🎯',
        color: 'bg-indigo-500',
        delay: 0.8
    },
    {
        id: 'submit-work',
        title: 'Submit & Review',
        description: 'Submit work for brand approval',
        icon: '📤',
        color: 'bg-teal-500',
        delay: 1.0
    },
    {
        id: 'get-paid',
        title: 'Get Paid',
        description: 'Receive payment for completed work',
        icon: '💰',
        color: 'bg-yellow-500',
        delay: 1.2
    }
];

const alternativeFlow: RoadmapStep[] = [
    {
        id: 'hire-crew',
        title: 'Hire Crew via Clan',
        description: 'Brands/Influencers hire crew through clans',
        icon: '👥',
        color: 'bg-blue-500',
        delay: 0
    },
    {
        id: 'assign-gig',
        title: 'Assign Gig',
        description: 'Assign specific tasks to crew members',
        icon: '📋',
        color: 'bg-purple-500',
        delay: 0.2
    },
    {
        id: 'crew-completes',
        title: 'Crew Completes',
        description: 'Crew members complete assigned tasks',
        icon: '✅',
        color: 'bg-green-500',
        delay: 0.4
    },
    {
        id: 'submit-work-alt',
        title: 'Submit Work',
        description: 'Submit completed work for review',
        icon: '📤',
        color: 'bg-orange-500',
        delay: 0.6
    },
    {
        id: 'get-paid-alt',
        title: 'Get Paid by Brands',
        description: 'Crew receives payment from brands',
        icon: '💰',
        color: 'bg-yellow-500',
        delay: 0.8
    }
];

export const BusinessRoadmap: React.FC = () => {
    const [activeFlow, setActiveFlow] = useState<'main' | 'alternative'>('main');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const stepVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const arrowVariants = {
        hidden: { opacity: 0, scaleX: 0 },
        visible: {
            opacity: 1,
            scaleX: 1,
            transition: {
                duration: 0.3,
                delay: 0.2
            }
        }
    };

    const currentSteps = activeFlow === 'main' ? roadmapSteps : alternativeFlow;

    return (
        <div className="py-1 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h2
                        className="text-3xl font-bold text-gray-900 mb-3"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        How 50BraIns Works
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-600 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Discover the seamless workflow that connects brands, influencers, and crew members
                    </motion.p>
                </div>

                {/* Flow Toggle */}
                <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-lg p-1 shadow-lg border">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveFlow('main')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeFlow === 'main'
                                    ? 'bg-brand-primary text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Main Flow
                            </button>
                            <button
                                onClick={() => setActiveFlow('alternative')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeFlow === 'alternative'
                                    ? 'bg-brand-primary text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Crew Flow
                            </button>
                        </div>
                    </div>
                </div>

                {/* Roadmap */}
                <motion.div
                    className="relative"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {/* Connection Lines */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent transform -translate-y-1/2 hidden lg:block" />

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6 relative">
                        {currentSteps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                className="relative"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: step.delay }}
                            >
                                {/* Step Card */}
                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    {/* Icon */}
                                    <motion.div
                                        className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-xl mx-auto mb-3 shadow-lg`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {step.icon}
                                    </motion.div>

                                    {/* Content */}
                                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>

                                    {/* Step Number */}
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Arrow (Desktop) */}
                                {index < currentSteps.length - 1 && (
                                    <motion.div
                                        className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10"
                                        variants={arrowVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: step.delay + 0.3 }}
                                    >
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Connection Lines */}
                    <div className="lg:hidden mt-6">
                        <div className="flex flex-col space-y-3">
                            {currentSteps.map((step, index) => (
                                <motion.div
                                    key={`mobile-${step.id}`}
                                    className="flex items-center space-x-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: step.delay }}
                                >
                                    <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-lg shadow-lg`}>
                                        {step.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm">{step.title}</h4>
                                        <p className="text-xs text-gray-600">{step.description}</p>
                                    </div>
                                    {index < currentSteps.length - 1 && (
                                        <motion.div
                                            className="text-gray-400"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: step.delay + 0.3 }}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Call to Action */}
                {/* <motion.div
                    className="text-center mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.5 }}
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Ready to Get Started?
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
                        Join thousands of brands, influencers, and crew members already using 50BraIns to create amazing content together.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button className="btn-primary px-6 py-2 text-base">
                            Join as Brand
                        </button>
                        <button className="btn-secondary px-6 py-2 text-base">
                            Join as Influencer
                        </button>
                        <button className="btn-ghost px-6 py-2 text-base">
                            Join as Crew
                        </button>
                    </div>
                </motion.div> */}
            </div>
        </div>
    );
}; 