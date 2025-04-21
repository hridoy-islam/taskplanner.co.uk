'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Edit2, Check, X, Edit } from 'lucide-react';
import Linkify from 'react-linkify';
import { ArrowUpRightFromSquare, DownloadIcon } from 'lucide-react';
import moment from 'moment';
import axiosInstance from '@/lib/axios';

export function MessageList({
  commentsEndRef,
  remainingMessages,
  loadMoreComments,
  comments,
  user,
  groupDetails,
  limit
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleEditClick = (comment: any) => {
    setEditingId(comment._id);
    setEditingContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const saveEdit = async (commentId: string) => {
    try {
      const res = await axiosInstance.patch(`/groupMessage/${commentId}`, {
        content: editingContent
      });

      if (res.status === 200) {
        // You may want to re-fetch the messages instead
        const updatedIndex = comments.findIndex(
          (c: any) => c._id === commentId
        );
        if (updatedIndex !== -1) {
          comments[updatedIndex].content = editingContent;
        }
        setEditingId(null);
        setEditingContent('');
      }
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  return (
    <div ref={commentsEndRef} className="flex-grow overflow-y-auto">
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
        {comments.map((comment: any) => {
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
              className={`mb-4 flex w-full gap-1 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {isUser && !isFile && editingId !== comment._id && (
                <Edit
                  className="ml-2 h-4 w-4 cursor-pointer text-gray-600 "
                  onClick={() => handleEditClick(comment)}
                />
              )}
              <div className="flex flex-col items-end justify-end">
                <div
                  className={`relative flex min-w-[150px] max-w-[300px] flex-col ${
                    isUser
                      ? 'bg-[#151261] text-white'
                      : 'bg-[#9333ea] text-white'
                  } rounded-lg p-3`}
                  style={{
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word'
                  }}
                >
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="md:text-md text-xs md:font-semibold">
                      {comment?.authorId?.name}
                    </span>
                  </div>

                  <div className="max-w-full">
                    {editingId === comment._id ? (
                      <div className="flex flex-col gap-1">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="rounded-sm p-1 text-sm text-black"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={cancelEdit}
                            size="sm"
                            variant="secondary"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => saveEdit(comment._id)}
                            size="sm"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : isFile ? (
                      <div
                        className={`flex items-center space-x-2 rounded-lg p-2 ${
                          isUser ? 'bg-blue-500/15' : 'bg-green-300/80'
                        }`}
                      >
                        {parsedContent.mimeType?.startsWith('image/') ? (
                          <div className="flex items-end space-x-2">
                            <img
                              src={parsedContent.cdnUrl || '/placeholder.svg'}
                              alt={parsedContent.originalFilename || 'Preview'}
                              className="max-h-32 max-w-full rounded shadow-sm"
                            />
                            <a
                              href={parsedContent.cdnUrl}
                              download={parsedContent.originalFilename}
                              className="justify-between text-gray-900 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ArrowUpRightFromSquare className="h-5 w-5" />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between space-x-2">
                            <span className="overflow-hidden">
                              {parsedContent.originalFilename || 'File'}
                            </span>
                            <a
                              href={parsedContent}
                              download={parsedContent}
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <DownloadIcon className="h-4 w-4" />
                            </a>
                          </div>
                        )}
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
                            style={{
                              textDecoration: 'underline',
                              color: 'inherit'
                            }}
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

                {/* Seen & Timestamp */}
                <div
                  className={`flex w-full flex-row items-center gap-1 ${
                    !isUser ? 'justify-end' : 'justify-between'
                  }`}
                >
                  {isUser && (
                    <p className="text-xs text-gray-500">
                      {comment?.seenBy?.length === groupDetails?.members?.length
                        ? 'Seen by All'
                        : comment?.seenBy?.length > 1
                          ? 'Seen by'
                          : 'Delivered'}
                    </p>
                  )}

                  <span className="text-[10px] opacity-70">
                    {moment(comment?.createdAt).isSame(moment(), 'day')
                      ? moment(comment?.createdAt).format('hh:mm A')
                      : moment(comment?.createdAt).format('YYYY-MM-DD')}
                  </span>
                </div>

                {/* Seen By Names */}
                {isUser && groupDetails?.members && (
                  <div className="flex w-full flex-row items-center">
                    {(() => {
                      const filteredMembers =
                        groupDetails.members?.filter(
                          (member) =>
                            member.lastMessageReadId === comment?._id &&
                            member._id !== comment?.creatorId &&
                            member._id !== user?._id
                        ) || [];

                      return filteredMembers.length > 0 ? (
                        <p className="text-[12px]">
                          {filteredMembers.map((item) => item.name).join(', ')}
                        </p>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
