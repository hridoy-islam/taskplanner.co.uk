'use client';
import { Button } from '@/components/ui/button';
import { ArrowUp, Edit } from 'lucide-react';
import Linkify from 'react-linkify';
import { ArrowUpRightFromSquare, DownloadIcon } from 'lucide-react';
import moment from 'moment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

export function MessageList({
  commentsEndRef,
  remainingMessages,
  loadMoreComments,
  comments,
  user,
  groupDetails,
  limit,
  setEditingMessage,
}) {
  const handleEditClick = (comment) => {
    // Instead of managing edit state locally, pass it up to parent
    setEditingMessage({
      id: comment._id,
      content: comment.content,
    });
  };

  // Reference to the scroll container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
  if (commentsEndRef.current) {
    commentsEndRef.current.scrollIntoView({ behavior: 'auto' });
  }
}, [comments]);


  return (
    <ScrollArea ref={scrollContainerRef} className="flex-grow overflow-y-auto">
      <div className="flex w-full justify-center">
        {remainingMessages >= limit && (
          <Button
            onClick={loadMoreComments}
            variant={'link'}
            className="flex flex-row justify-center gap-2 text-blue-600"
          >
            Load more
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="p-4">
        {comments.map((comment) => {
          const isFile = comment.isFile;
          let parsedContent = comment.content;

          if (isFile) {
            try {
              parsedContent = JSON.parse(comment.content);
            } catch (error) {
              console.error('Failed to parse file content:', error);
            }
          }

          const isUser = comment.authorId._id === user?._id;

          return (
            <div
              key={comment._id}
              className={`group mb-4 flex w-full flex-row gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative flex flex-col items-end justify-end">
                {isUser && !isFile && (
                  <div className="absolute -left-8 top-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      onClick={() => handleEditClick(comment)}
                      className="rounded-full bg-gray-100 p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                      aria-label="Edit message"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div
                  className={`relative flex min-w-[120px] max-w-[320px] flex-col ${
                    isUser
                      ? 'rounded-tr-none bg-[#0a3d62] text-white'
                      : 'rounded-tl-none bg-[#38ada9] text-white'
                  } rounded-2xl p-3 transition-all duration-200 group-hover:shadow-md`}
                  style={{
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                  }}
                >
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {comment?.authorId?.name}
                    </span>
                  </div>

                  <div className="max-w-full">
                    <div className="max-w-full">
                      {isFile ? (
                        <div
                          className={`flex items-center space-x-2 rounded-lg p-2 ${
                            isUser ? 'bg-blue-500/15' : 'bg-green-300/80'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <>
                              <img
                                src={parsedContent || ''}
                                alt={'File'}
                                className="max-h-32 max-w-full rounded shadow-sm"
                              />
                              <a
                                href={parsedContent}
                                download={parsedContent.originalFilename}
                                className="justify-between text-gray-900 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ArrowUpRightFromSquare className="h-5 w-5 text-gray-500 hover:text-gray-200" />
                              </a>
                            </>
                          </div>
                        </div>
                      ) : (
                        <Linkify
                          componentDecorator={(
                            decoratedHref,
                            decoratedText,
                            key
                          ) => (
                            <a
                              href={decoratedHref}
                              key={key}
                              className="text-blue-300 underline transition-colors hover:text-blue-200"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {decoratedText}
                            </a>
                          )}
                        >
                          {comment.content}
                        </Linkify>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message metadata */}
                <div
                  className={`mt-1 flex w-full flex-row items-center gap-1 ${
                    !isUser ? 'justify-end' : 'justify-between'
                  }`}
                >
                  {isUser && (
                    <p className="text-xs text-gray-500">
                      {(() => {
                        const totalMembers = groupDetails?.members?.length || 0;
                        const seenCount = comment?.seenBy?.length || 0;
                        const allSeen = seenCount === totalMembers;

                        const filteredMembers =
                          groupDetails?.members?.filter(
                            (member) =>
                              member.lastMessageReadId === comment?._id &&
                              member._id !== comment?.creatorId &&
                              member._id !== user?._id
                          ) || [];

                        if (allSeen) {
                          return 'Seen by All';
                        } else if (filteredMembers.length > 0) {
                          return `Seen by: ${filteredMembers.map((item) => item.name).join(', ')}`;
                        } else {
                          return 'Delivered';
                        }
                      })()}
                    </p>
                  )}

                  <div className="flex items-center gap-1">
                    {comment.editedAt && (
                      <span className="text-[10px] italic text-gray-400">
                        edited
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">
                      {moment(comment?.createdAt).isSame(moment(), 'day')
                        ? moment(comment?.createdAt).format('h:mm A')
                        : moment(comment?.createdAt).format('MMM D')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
         <div ref={commentsEndRef} />
      </div>
    </ScrollArea>
  );
}