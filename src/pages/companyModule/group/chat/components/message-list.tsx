'use client';
import { Button } from '@/components/ui/button';
import {
  ArrowUp,
  Edit,
  ArrowUpRightFromSquare,
  File as FileIcon,
  Download,
  Reply
} from 'lucide-react';
import Linkify from 'react-linkify';
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
  setReplyingTo
}) {
  const handleEditClick = (comment) => {
    setEditingMessage({
      id: comment._id,
      content: comment.content
    });
  };

  const handleReplyClick = (comment) => {
    setReplyingTo(comment);
  };

  const scrollToMessage = (messageId) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Optional: Add a temporary highlight effect
      const messageBubble = element.querySelector('.message-bubble');
      if (messageBubble) {
        const originalBg = messageBubble.className;
        messageBubble.classList.add(
          'ring-4',
          'ring-white/50',
          'brightness-125'
        );
        setTimeout(() => {
          messageBubble.classList.remove(
            'ring-4',
            'ring-white/50',
            'brightness-125'
          );
        }, 1500);
      }
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [comments]);

  // Function to render message content with mention highlighting
 const renderMessageWithMentions = (content: string, mentionBy: any[]) => {
    if (!mentionBy || mentionBy.length === 0) {
      return (
        <Linkify
          componentDecorator={(decoratedHref, decoratedText, key) => (
            <a
              href={decoratedHref}
              key={key}
              className="text-taskplanner underline transition-colors hover:text-taskplanner"
              target="_blank"
              rel="noopener noreferrer"
            >
              {decoratedText}
            </a>
          )}
        >
          {content}
        </Linkify>
      );
    }

    // 1. Extract valid names and sort by length descending (longest names first)
    // This prevents "@John" from overriding "@John Doe"
    const validNames = mentionBy
      .map(m => m.name)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    if (validNames.length === 0) {
      return <Linkify>{content}</Linkify>;
    }

    // 2. Escape special regex characters in names just in case
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedNames = validNames.map(escapeRegExp);

    // 3. Create a dynamic, case-insensitive regex matching only the exact names
    const mentionRegex = new RegExp(`@(${escapedNames.join('|')})`, 'gi');

    const parts: any[] = [];
    let currentIndex = 0;
    let match;

    // 4. Split the text using our exact-match regex
    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before this mention
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: content.slice(currentIndex, match.index)
        });
      }
      
      // Add the exact mention
      parts.push({
        type: 'mention',
        content: match[0], // full match including the @
        isMentioned: true
      });
      
      currentIndex = mentionRegex.lastIndex;
    }

    // Add remaining text after last mention
    if (currentIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(currentIndex)
      });
    }

    // Render the separated parts
    return (
      <>
        {parts.map((part, index) => {
          if (part.type === 'mention' && part.isMentioned) {
            return (
              <span 
                key={index} 
                className="font-semibold text-[#1abc9c]"
              >
                {part.content}
              </span>
            );
          } else {
            return (
              <Linkify
                key={index}
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a
                    href={decoratedHref}
                    key={key}
                    className="text-taskplanner underline transition-colors hover:text-taskplanner/90"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {decoratedText}
                  </a>
                )}
              >
                {part.content}
              </Linkify>
            );
          }
        })}
      </>
    );
  };

  return (
    <ScrollArea ref={scrollContainerRef} className="flex-grow overflow-y-auto">
      <div className="flex w-full justify-center">
        {remainingMessages >= limit && (
          <Button
            onClick={loadMoreComments}
            variant={'link'}
            className="flex flex-row justify-center gap-2 text-taskplanner"
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

          // Variables to determine file type & details
          let isImage = false;
          let fileUrl = '';
          let fileName = 'Attached File';

          if (isFile) {
            try {
              parsedContent = JSON.parse(comment.content);
              fileUrl = parsedContent.url || parsedContent.fileUrl || '';
              fileName = parsedContent.originalFilename || 'Attached File';
              isImage = parsedContent.mimeType?.startsWith('image/');
            } catch (error) {
              // If it's just a raw URL string
              parsedContent = comment.content;
              fileUrl = comment.content;
              fileName = 'Attached File';
              isImage =
                !!fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) ||
                fileUrl.startsWith('data:image/');
            }
          }

          const isUser = comment.authorId._id === user?._id;

          return (
            <div
              id={`message-${comment._id}`}
              key={comment._id}
              className={`group mb-4 flex w-full flex-row gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative flex flex-col items-end justify-end">
                <div
                  className={`absolute top-1 z-10 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${isUser ? '-left-16' : '-right-8'}`}
                >
                  <button
                    onClick={() => handleReplyClick(comment)}
                    className="rounded-full  p-1.5 text-gray-600 transition-colors  hover:text-gray-800"
                    aria-label="Reply to message"
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </button>
                  {isUser && !isFile && (
                    <button
                      onClick={() => handleEditClick(comment)}
                      className="rounded-full  p-1.5 text-gray-600 transition-colors  hover:text-gray-800"
                      aria-label="Edit message"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div
                  className={`relative flex min-w-[120px] max-w-[520px] text-xs flex-col ${
                    isUser
                     ? 'rounded-tr-none bg-[#d8fcd2] text-black'
                        : 'rounded-tl-none bg-[#fafafa] text-black'
                  } rounded-2xl p-3 transition-all duration-200 group-hover:shadow-md`}
                  style={{
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word'
                  }}
                >
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="text-sm font-bold">
                      {comment?.authorId?.name}
                    </span>
                  </div>

                  <div className="max-w-full">
                    {comment.replyTo && (
                      <div
                        onClick={() => scrollToMessage(comment.replyTo._id)}
                        className="mb-2 flex cursor-pointer flex-col rounded border-l-4 border-white/60 bg-taskplanner/80 p-2 text-xs transition-colors hover:bg-black/30"
                      >
                        <span className="pb-1 font-semibold text-white/90">
                          {comment.replyTo?.authorId?.name || 'Someone'}
                        </span>
                        <p className="line-clamp-1 truncate italic text-white/80">
                          {comment.replyTo?.isFile
                            ? '📎 Attachment'
                            : comment.replyTo?.content}
                        </p>
                      </div>
                    )}
                    <div className="max-w-full">
                      {isFile ? (
                        isImage ? (
                          // If it's an image, render the image tag
                          <div className="relative mt-1 inline-block">
                            <img
                              src={fileUrl}
                              alt={'Attachment'}
                              className="max-h-48 max-w-full rounded-lg shadow-sm"
                            />
                            <a
                              href={fileUrl}
                              download={fileName}
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open/Download File"
                            >
                              <ArrowUpRightFromSquare className="h-4 w-4" />
                            </a>
                          </div>
                        ) : (
                          // If it's NOT an image, render a nice file document card
                          <div className="mt-1 flex items-center space-x-3 rounded-lg bg-taskplanner p-3 backdrop-blur-sm">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-white/20">
                              <FileIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <span
                                className="truncate text-sm font-medium text-white"
                                title={fileName}
                              >
                                {fileName}
                              </span>
                              <a
                                href={fileUrl}
                                download={fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-0.5 flex items-center text-xs text-blue-100 hover:text-white hover:underline"
                              >
                                <Download className="mr-1 h-3 w-3" />
                                Download File
                              </a>
                            </div>
                          </div>
                        )
                      ) : (
                        renderMessageWithMentions(
                          comment.content,
                          comment.mentionBy || []
                        )
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
                        : moment(comment?.createdAt).format('MMM D, YYYY')}
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
