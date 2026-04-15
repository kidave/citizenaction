"use client";

import PostScopeSelector from "./PostScopeSelector";

export default function PostContextBar({ profile, post, editor }) {

  return (

      <div className="flex items-center gap-2 flex-wrap">
        
        <PostScopeSelector
            profile={profile}
            post={post}
            space_id={editor.space_id}
            setSpaceId={editor.setSpaceId}
            club_id={editor.club_id}
            setClubId={editor.setClubId}
        />

      </div>

  );
}