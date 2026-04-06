"use client";

import { UserIdentity } from "@/components/profile/UserIdentity";

export default function UserAvatarGroup({
  users = [],
  max = 5,
}) {
  if (!users?.length) return null;

  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center -space-x-2">

      {visible.map((user, i) => (
        <div key={user.id || i}>
          <UserIdentity
            username={user.username}
            name={user.name}
            avatar={user.avatar}
            hideName
            size="sm"
          />
        </div>
      ))}

      {remaining > 0 && (
        <div className="h-6 w-6 flex items-center justify-center text-xs bg-muted border rounded-full">
          +{remaining}
        </div>
      )}

    </div>
  );
}