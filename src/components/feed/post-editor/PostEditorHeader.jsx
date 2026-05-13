"use client";

import Image from "next/image";
import PostVisibilitySelector from "@/components/space/PostVisibilitySelector";

export default function PostEditorHeader({
  profile,
  post,
  editor,
  spaces = [],
}) {

  return (
    <div className="border-b p-4">

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >

        {/* LEFT */}
        <div
          className="
            flex
            items-center
            gap-3
            min-w-0
          "
        >

          {/* USER */}
          <div
            className="
              flex
              items-center
              gap-3
              min-w-0
            "
          >

            <Image
              src={
                profile?.avatar_url ||
                "/user1.png"
              }
              width={34}
              height={34}
              className="
                rounded-full
                shrink-0
              "
              alt=""
            />

            <div
              className="
                text-sm
                font-medium
                truncate
              "
            >
              {profile?.name}
            </div>

          </div>

          {/* VISIBILITY */}
          <PostVisibilitySelector
            editor={editor}
            spaces={spaces}
          />

        </div>
      </div>
    </div>
  );
}