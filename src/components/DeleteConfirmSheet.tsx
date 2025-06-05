import { Sheet, YStack, XStack, Button, Text, H4, Separator } from 'tamagui'
import { AlertTriangle, Trash2, X, ArrowUp } from '@tamagui/lucide-icons'
import type { TravelCardData } from '../data/travelData'
import { useTheme } from '../contexts/ThemeContext'

interface DeleteConfirmSheetProps {
  isOpen: boolean
  onClose: () => void
  card: TravelCardData | null
  onConfirm: (card: TravelCardData) => void
  allCards?: TravelCardData[] // 添加所有卡片数据以检查planB关系
}

export const DeleteConfirmSheet: React.FC<DeleteConfirmSheetProps> = ({
  isOpen,
  onClose,
  card,
  onConfirm,
  allCards = [],
}) => {
  // 使用默认值防止card为null时组件崩溃
  const safeCard = card || {
    id: '',
    title: '',
    day: 'Day 1',
    time: '',
    category: '',
    description: [],
    tips: [],
    highlights: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    amapUrl: '',
    transportation: ''
  } as TravelCardData

  // 检查是否有关联的planB
  const relatedPlanB = card && !card.isPlanB 
    ? allCards.find(c => c.isPlanB && c.planAId === card.id)
    : undefined

  // 处理确认删除
  const handleConfirm = () => {
    if (card) {
      onConfirm(card)
    }
    onClose()
  }

  // 处理取消删除
  const handleCancel = () => {
    onClose()
  }

  const { theme } = useTheme()

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      snapPointsMode='fit'
      dismissOnSnapToBottom
    >
        <Sheet.Handle 
            bg='$color4'
            mb='$3'
            borderRadius="$2"
        />
      <Sheet.Overlay
        animation="lazy"
        backgroundColor="$shadow4"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame p="$4" mb='$6' gap="$3">
        <XStack alignItems="center" gap="$3" mb='$1'>
          <AlertTriangle size={24} color="$red10" />
          <H4 color="$red10">确认删除</H4>
        </XStack>
        <YStack gap="$3">
          <Text fontSize="$4" color="$color11">
            您确定要删除行程卡片 "{safeCard.title}" 吗？此操作无法撤销。
          </Text>
          
          {relatedPlanB && (
            <YStack 
              p="$3" 
              bg="$accent2" 
              borderRadius="$4" 
              borderColor="$accent6" 
              borderWidth={1}
              gap="$2"
            >
              <XStack alignItems="center" gap="$2">
                <ArrowUp size={16} color="$accent10" />
                <Text fontSize="$3" color="$accent11" fontWeight="600">
                  智能提升
                </Text>
              </XStack>
              <Text fontSize="$3" color="$accent10">
                检测到备选方案 "{relatedPlanB.title}"，删除后将自动提升为主方案。
              </Text>
            </YStack>
          )}
        </YStack>
        <YStack gap="$3" mt="$3">
          <Button
            theme="error"
            variant="filled"
            {...(theme === 'light' && { 
                backgroundColor: "$red10",
                color: "rgb(255, 255, 255)",
                pressStyle: {
                    backgroundColor: "$red11",
                    color: "rgb(255, 255, 255)"
                },
                hoverStyle: {
                    backgroundColor: "$red11",
                    color: "rgb(255, 255, 255)"
                }
                })}
            icon={Trash2}
            onPress={handleConfirm}
            size="$4"
            fontWeight={600}
          >
            确认删除
          </Button>
          <Button
            variant="outlined"
            icon={X}
            onPress={handleCancel}
            size="$4"
          >
            取消
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
