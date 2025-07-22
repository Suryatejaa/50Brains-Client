import React from 'react';

interface RoleBadgesProps {
  roles: string[];
  className?: string;
}

const RoleBadges: React.FC<RoleBadgesProps> = ({ roles, className = '' }) => {
  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'INFLUENCER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BRAND':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CREW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MODERATOR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  if (!roles || roles.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {roles.map((role, index) => (
        <span
          key={index}
          className={`inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-medium ${getRoleColor(
            role
          )}`}
        >
          {formatRole(role)}
        </span>
      ))}
    </div>
  );
};

export default RoleBadges;
