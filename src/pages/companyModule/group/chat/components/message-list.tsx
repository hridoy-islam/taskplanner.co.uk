'use client';
import { Button } from '@/components/ui/button';
import { 
  ArrowUp, 
  Edit, 
  ArrowUpRightFromSquare, 
  File as FileIcon, 
  Download 
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
}) {
  const handleEditClick = (comment) => {
    setEditingMessage({
      id: comment._id,
      content: comment.content,
    });
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
              className="text-blue-300 underline transition-colors hover:text-blue-200"
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

    // Create a map of mentioned user names for quick lookup
    const mentionedNames = new Set(
      mentionBy.map(m => m.name?.toLowerCase()).filter(Boolean)
    );

    // Split content by @ mentions but keep the structure
    const parts: any[] = [];
    let currentIndex = 0;
    
    // Find all @mentions in the content
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    let match;
    
    const matches: any[] = [];
    while ((match = mentionRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        fullMatch: match[0],
        name: match[1]
      });
    }
    
    // Build parts array
    matches.forEach((match, i) => {
      // Add text before this mention
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: content.slice(currentIndex, match.index)
        });
      }
      
      // Check if this mention is in the mentionBy array
      const isMentioned = mentionedNames.has(match.name.toLowerCase());
      
      // Add the mention
      parts.push({
        type: 'mention',
        content: match.fullMatch,
        isMentioned
      });
      
      currentIndex = match.index + match.length;
    });
    
    // Add remaining text after last mention
    if (currentIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(currentIndex)
      });
    }
    
    // If no mentions found, just return the content with linkify
    if (parts.length === 0) {
      return (
        <Linkify
          componentDecorator={(decoratedHref, decoratedText, key) => (
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
          {content}
        </Linkify>
      );
    }
    
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
                    className="text-blue-300 underline transition-colors hover:text-blue-200"
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
              isImage = !!fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || fileUrl.startsWith('data:image/');
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
                        isImage ? (
                          // If it's an image, render the image tag
                          <div className="relative inline-block mt-1">
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
                          <div className="mt-1 flex items-center space-x-3 rounded-lg bg-black/10 p-3 backdrop-blur-sm">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-white/20">
                              <FileIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-sm font-medium text-white" title={fileName}>
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
                        renderMessageWithMentions(comment.content, comment.mentionBy || [])
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