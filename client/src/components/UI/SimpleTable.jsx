import React from 'react';
import GlassCard from './GlassCard';
import { cn } from '../../utils/cn';

const SimpleTable = ({
    headers, // Array of strings or objects { label, className }
    children, // tbody content (rows)
    emptyState, // Content to show if table is empty
    className
}) => {
    return (
        <GlassCard className={cn("flex-1 overflow-hidden flex flex-col p-0 border-white/5 bg-gradient-to-b from-surface/5 to-surface/2", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-wider font-semibold">
                            {headers.map((header, index) => {
                                const label = typeof header === 'object' ? header.label : header;
                                const headerClass = typeof header === 'object' ? header.className : '';
                                return (
                                    <th
                                        key={index}
                                        className={cn("p-4", headerClass)}
                                    >
                                        {label}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {children || emptyState}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};

export default SimpleTable;
