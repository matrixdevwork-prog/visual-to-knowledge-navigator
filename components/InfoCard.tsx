import React, { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  color?: 'blue' | 'indigo' | 'purple' | 'teal';
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, className = '', color = 'blue' }) => {
  const colorStyles = {
    blue: "border-blue-100 bg-blue-50/50",
    indigo: "border-indigo-100 bg-indigo-50/50",
    purple: "border-purple-100 bg-purple-50/50",
    teal: "border-teal-100 bg-teal-50/50",
  };

  const headerColors = {
     blue: "text-blue-700",
     indigo: "text-indigo-700",
     purple: "text-purple-700",
     teal: "text-teal-700",
  };

  return (
    <div className={`rounded-xl border shadow-sm p-6 ${colorStyles[color]} ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className={`${headerColors[color]}`}>{icon}</div>}
        <h3 className={`text-lg font-bold ${headerColors[color]}`}>{title}</h3>
      </div>
      <div className="text-slate-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default InfoCard;
