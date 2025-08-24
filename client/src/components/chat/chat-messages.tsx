import { memo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Message } from '@shared/schema';

const ChatMessages = memo(({ messages }: { messages: Message[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 100, []),
    overscan: 5
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={message.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MessageItem message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

const MessageItem = memo(({ message }: { message: Message }) => {
  // Message rendering logic here
});
