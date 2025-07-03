import React from 'react';
import { X, PlusCircle } from 'lucide-react';
import { AVAILABLE_ROLES } from '../constants';

interface RoleManagerProps {
  userRoles: string[];
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export const RoleManager: React.FC<RoleManagerProps> = ({
  userRoles,
  isEditing,
  onUpdate,
}) => {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {isEditing ? (
        <div className="w-full space-y-2">
          <div className="flex flex-wrap gap-2">
            {userRoles.map((role) => (
              <div key={role} className="group relative">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    role === 'INFLUENCER'
                      ? 'bg-purple-100 text-purple-800'
                      : role === 'BRAND'
                        ? 'bg-blue-100 text-blue-800'
                        : role === 'CREW'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {role.toLowerCase().replace('_', ' ')}
                  {!['USER'].includes(role) && (
                    <button
                      onClick={() => {
                        // Remove role functionality
                        const updatedRoles = userRoles.filter(
                          (r) => r !== role
                        );
                        onUpdate('roles', updatedRoles);
                      }}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <div className="relative flex-1">
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  if (e.target.value && !userRoles.includes(e.target.value)) {
                    const updatedRoles = [...userRoles, e.target.value];
                    onUpdate('roles', updatedRoles);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Add a role...
                </option>
                {AVAILABLE_ROLES.map(
                  (role) =>
                    !userRoles.includes(role.value as string) && (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    )
                )}
              </select>
              <PlusCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {userRoles.map((role) => (
            <span
              key={role}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                role === 'INFLUENCER'
                  ? 'bg-purple-100 text-purple-800'
                  : role === 'BRAND'
                    ? 'bg-blue-100 text-blue-800'
                    : role === 'CREW'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
              }`}
            >
              {role.toLowerCase().replace('_', ' ')}
            </span>
          ))}
        </>
      )}
    </div>
  );
};
