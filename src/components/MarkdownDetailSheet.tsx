import React, { useRef, useEffect } from 'react'
import { Sheet, YStack, H3, ScrollView, Text, Button } from 'tamagui'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface MarkdownDetailSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: string
}

export const MarkdownDetailSheet: React.FC<MarkdownDetailSheetProps> = ({
  isOpen,
  onOpenChange,
  title,
  content
}) => {
  const scrollViewRef = useRef<ScrollView>(null)

  // 重置滚动位置当sheet打开时
  useEffect(() => {
    if (scrollViewRef.current && isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false })
      }, 100)
    }
  }, [isOpen])

  return (
    <Sheet 
      modal={true} 
      open={isOpen} 
      onOpenChange={onOpenChange} 
      dismissOnSnapToBottom 
      forceRemoveScrollEnabled={isOpen}
      snapPoints={[90]}
    >
      <Sheet.Overlay         
        animation="lazy"
        backgroundColor="$shadow6"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle 
        bg='$color4'
        mb='$3'
        borderRadius="$2"
      />
      <Sheet.Frame 
        p="$4" 
        gap="$4" 
        bg="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        <YStack gap="$4" flex={1}>
          <H3 color="$color12" mt='$2'>{title}</H3>
          
          <ScrollView ref={scrollViewRef} mb='$2'>
            <YStack gap="$2" p="$2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => (
                    <YStack mb="$2">
                      <Text 
                        fontSize="$3" 
                        color="$color11" 
                        lineHeight="$2"
                      >
                        {children}
                      </Text>
                    </YStack>
                  ),
                  h1: ({ children }) => (
                    <YStack mb="$3">
                      <Text 
                        fontSize="$6" 
                        fontWeight="bold"
                        color="$color12"
                      >
                        {children}
                      </Text>
                    </YStack>
                  ),
                  h2: ({ children }) => (
                    <YStack mb="$3">
                      <Text 
                        fontSize="$5" 
                        fontWeight="bold"
                        color="$color12"
                      >
                        {children}
                      </Text>
                    </YStack>
                  ),
                  h3: ({ children }) => (
                    <YStack mb="$1">
                      <Text 
                        fontSize="$4" 
                        fontWeight="600"
                        color="$color12"
                      >
                        {children}
                      </Text>
                    </YStack>
                  ),
                  ul: ({ children }) => (
                    <YStack gap="$1" mb="$2">
                      {children}
                    </YStack>
                  ),
                  li: ({ children }) => (
                    <Text 
                      fontSize="$3" 
                      color="$color10" 
                      lineHeight="$1"
                    >
                      • {children}
                    </Text>
                  ),
                  strong: ({ children }) => (
                    <Text 
                      fontWeight="bold"
                      color="$color12"
                    >
                      {children}
                    </Text>
                  ),
                  a: ({ children, href }) => (
                    <Text 
                      color="$accent8"
                      textDecorationLine="underline"
                      onPress={() => {
                        if (href && typeof window !== 'undefined') {
                          window.open(href, '_blank')
                        }
                      }}
                    >
                      {children}
                    </Text>
                  )
                }}
              >
                {content || '暂无详细内容'}
              </ReactMarkdown>
            </YStack>
          </ScrollView>

          <Button
            size="$4"
            bg="$color5"
            mb="$4"
            onPress={() => onOpenChange(false)}
          >
            关闭
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
