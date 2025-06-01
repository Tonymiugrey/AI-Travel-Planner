import React, { useState } from 'react'
import { Button, Card, Text, XStack, YStack, Sheet, H3, ScrollView, H4 } from 'tamagui'
import { MapPin, Clock, Navigation, Info, X } from '@tamagui/lucide-icons'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { TravelCardData } from '../data/travelData'

interface TravelCardProps {
  data: TravelCardData
}

export const TravelCard: React.FC<TravelCardProps> = ({ data }) => {
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleNavigate = () => {
    const amapUrl = data.amapUrl
    // In a real app, you would use Linking.openURL(amapUrl) for React Native
    // or window.open(amapUrl) for web
    if (typeof window !== 'undefined') {
      window.open(amapUrl, '_blank')
    }
  }


  return (
    <Card
      elevate
      size="$5"
      bordered
      width="100%"
      height="100%"
      bg="$background"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.1}
      shadowRadius={8}
      borderRadius="$6"
      overflow="hidden"
    >
        <YStack flex={1} p="$4" gap={"$4"}>
            {/* Header */}
            <YStack
                bg="$color2"
                borderTopRightRadius="$6"
                borderTopLeftRadius="$6"
                gap="$4"
            >
                <XStack>
                    <Text
                    fontSize="$2"
                    color="$color11"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing={1}
                    flex={1}
                    >
                    {data.category}
                    </Text>
                    
                    <Text
                        bg="$color4"
                        px="$2"
                        py="$1"
                        fontSize="$1"
                        color="$color10"
                        borderEndEndRadius={"$1"}
                        borderStartStartRadius={"$1"}
                        borderStartEndRadius={"$1"}
                        borderEndStartRadius={"$1"}
                    >
                        {data.day} | {data.time}
                    </Text>
                </XStack>
            </YStack>
                            {/* Content */}
                <YStack gap="$3">                
                    <YStack gap="$3" >
                        <XStack gap="$2">
                            <XStack gap="$2" flex={1}>
                                <MapPin size={16} color="$color11" />
                                <Text fontSize="$3" fontWeight="600" color="$color11" flex={1}>
                                    {data.title}
                                </Text>
                            </XStack>
                            {data.transportation && (
                                <Text
                                    fontSize="$1"
                                    color="$color10"
                                    bg="$color4"
                                    px="$2"
                                    py="$1"
                                    borderEndEndRadius={"$1"}
                                    borderStartStartRadius={"$1"}
                                    borderStartEndRadius={"$1"}
                                    borderEndStartRadius={"$1"}
                                >
                                    {data.transportation}
                                </Text>
                            )}
                        </XStack>
                    </YStack>
                </YStack>

                <YStack gap="$3">
                    {(data.departureTime || data.arrivalTime || data.duration) && (
                        <YStack gap="$2">
                            <XStack gap="$2">
                                <Clock size={16} color="$color11" />
                                <Text fontSize="$3" fontWeight="600" color="$color11">
                                    时间安排
                                </Text>
                            </XStack>
                            <YStack gap="$1" pl="$5">
                                {data.departureTime && (
                                    <Text fontSize="$2" color="$color10">出发:    {data.departureTime}</Text>
                                )}
                                {data.arrivalTime && (
                                     <Text fontSize="$2" color="$color10">到达:    {data.arrivalTime}</Text>
                                )}
                                {data.duration && (
                                    <Text fontSize="$2" color="$color10">停留时间:    {data.duration}</Text>
                                )}
                            </YStack>
                        </YStack>
                    )}
                </YStack>

                <YStack gap="$3">

                {data.description && (
                    <YStack gap="$2">
                    <Text fontSize="$3" fontWeight="600" color="$color11">
                        行程描述
                    </Text>
                    {data.description.map((item, index) => (
                        <Text
                        key={index}
                        fontSize="$2"
                        color="$color11"
                        numberOfLines={2}
                        >
                        • {item}
                        </Text>
                    ))}
                    </YStack>
                )}

                {data.tips && (
                    <YStack gap="$2">
                    <Text fontSize="$3" fontWeight="600" color="$color11">
                        小贴士
                    </Text>
                    {data.tips.map((item, index) => (
                        <Text
                        key={index}
                        fontSize="$2"
                        color="$color11"
                        numberOfLines={2}
                        >
                        • {item}
                        </Text>
                    ))}
                    </YStack>
                )}
                </YStack>
        </YStack>

        {/* Footer */}
        {(data.amapUrl || data.highlights) &&(
            <YStack
                p="$4"
                bg="$color1"
                borderBottomRightRadius="$6"
                borderBottomLeftRadius="$6"
            >
                <XStack gap={"$3"}>        
                    {data.amapUrl && (
                        <Button
                        size="$2"
                        icon={Navigation}
                        //bg="$blue8"
                        //color="white"
                        onPress={handleNavigate}
                        fontWeight={600}
                        >
                        导航
                        </Button>
                    )}

                    {(data.highlights) && (
                        <Button
                        size="$2"
                        //bg='orange'
                        //color="white"
                        icon={Info}
                        onPress={() => setSheetOpen(true)}
                        fontWeight={600}
                        >
                        详细行程
                        </Button>
                    )}
                </XStack>
            </YStack>
        )}

      {/* Sheet Modal */}
      <Sheet modal={true} open={sheetOpen} onOpenChange={setSheetOpen} dismissOnSnapToBottom snapPointsMode="percent" snapPoints={[90]}>
        <Sheet.Overlay         
          animation="lazy"
          backgroundColor="$shadow6"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}/>
        <Sheet.Handle bg='$color7' mb='$3'/>
        <Sheet.Frame 
          p="$4" 
          gap="$4" 
          bg="$background"
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
        >
        <Sheet.Handle/>

        <YStack gap="$4" flex={1}>
            <H3 color="$color12">{data.title}</H3>
            
            <ScrollView flex={1} mb='$2'>
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
                        color="$blue10"
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
                  {data.highlights || '暂无详细内容'}
                </ReactMarkdown>
              </YStack>
            </ScrollView>

            <Button
              size="$4"
              bg="$color5"
              mb="$6"
              onPress={() => setSheetOpen(false)}
            >
              关闭
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </Card>
  )
}
