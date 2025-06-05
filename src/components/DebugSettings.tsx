import React, { useState } from 'react'
import {
  YStack,
  XStack,
  Button,
  Text,
  H2,
  Card,
  Separator,
  Spinner,
  AlertDialog,
  Paragraph
} from 'tamagui'
import { Upload, Trash2, TestTube, ArrowLeft } from '@tamagui/lucide-icons'
import { LeanCloudService } from '../services/leancloudService'

interface DebugSettingsProps {
  onBack: () => void
}

export const DebugSettings: React.FC<DebugSettingsProps> = ({ onBack }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000) // 5秒后自动清除消息
  }

  const handleUploadData = async () => {
    setIsUploading(true)
    try {
      await LeanCloudService.createClassAndUploadData()
      showMessage('数据上传成功！', 'success')
    } catch (error) {
      showMessage(`上传失败: ${error}`, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAndReimport = async () => {
    setIsDeleting(true)
    setShowDeleteConfirm(false)
    try {
      await LeanCloudService.deleteAllAndReimport()
      showMessage('数据删除并重新导入成功！', 'success')
    } catch (error) {
      showMessage(`操作失败: ${error}`, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const isConnected = await LeanCloudService.testConnection()
      if (isConnected) {
        showMessage('LeanCloud 连接测试成功！', 'success')
      } else {
        showMessage('LeanCloud 连接测试失败', 'error')
      }
    } catch (error) {
      showMessage(`连接测试失败: ${error}`, 'error')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <YStack flex={1} p="$6" gap="$4" bg="$background">
      {/* Header */}
      <XStack alignItems="center" gap="$3">
        <Button
          size="$3"
          icon={ArrowLeft}
          variant="outlined"
          onPress={onBack}
        >
          返回
        </Button>
        <H2 flex={1}>调试设置</H2>
      </XStack>

      <Separator />

      {/* 消息显示区域 */}
      {message && (
        <Card
          bg={
            messageType === 'success' ? '$green3' :
            messageType === 'error' ? '$red3' : '$blue3'
          }
          borderColor={
            messageType === 'success' ? '$green7' :
            messageType === 'error' ? '$red7' : '$blue7'
          }
          p="$3"
        >
          <Text
            color={
              messageType === 'success' ? '$green11' :
              messageType === 'error' ? '$red11' : '$blue11'
            }
            fontWeight="500"
          >
            {message}
          </Text>
        </Card>
      )}

      {/* LeanCloud 操作区域 */}
      <Card p="$4" gap="$4">
        <H2 size="$6">LeanCloud 数据管理</H2>
        
        <YStack gap="$3">
          {/* 连接测试 */}
          <XStack gap="$3" alignItems="center">
            <Button
              size="$4"
              icon={isTesting ? Spinner : TestTube}
              onPress={handleTestConnection}
              disabled={isTesting}
              flex={1}
              variant="outlined"
            >
              {isTesting ? '测试中...' : '测试连接'}
            </Button>
          </XStack>

          <Separator />

          {/* 上传数据 */}
          <XStack gap="$3" alignItems="center">
            <Button
              size="$4"
              icon={isUploading ? Spinner : Upload}
              onPress={handleUploadData}
              disabled={isUploading || isDeleting}
              flex={1}
              theme="accent"
            >
              {isUploading ? '上传中...' : '创建并上传数据'}
            </Button>
          </XStack>

          <Text fontSize="$2" color="$color10">
            创建 TravelCard 类并将 travelData.ts 中的所有数据上传到 LeanCloud
          </Text>

          <Separator />

          {/* 删除并重新导入 */}
          <XStack gap="$3" alignItems="center">
            <Button
              size="$4"
              icon={isDeleting ? Spinner : Trash2}
              onPress={() => setShowDeleteConfirm(true)}
              disabled={isUploading || isDeleting}
              flex={1}
              theme="error"
            >
              {isDeleting ? '处理中...' : '删除并重新导入'}
            </Button>
          </XStack>

          <Text fontSize="$2" color="$color10">
            删除 LeanCloud 中的所有记录，然后重新导入 travelData.ts 中的数据
          </Text>
        </YStack>
      </Card>

      {/* 警告信息 */}
      <Card bg="$yellow2" borderColor="$yellow7" p="$3">
        <Text color="$yellow11" fontWeight="500" fontSize="$3">
          ⚠️ 注意事项
        </Text>
        <Text color="$yellow11" fontSize="$2" mt="$2">
          • 请确保已在 src/config/leancloud.ts 中配置正确的 LeanCloud 参数{'\n'}
          • 删除操作不可恢复，请谨慎使用{'\n'}
          • 建议在测试环境中进行操作
        </Text>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            scale={1}
            opacity={1}
            y={0}
          >
            <YStack gap="$3">
              <AlertDialog.Title>确认删除</AlertDialog.Title>
              <AlertDialog.Description>
                此操作将删除 LeanCloud 中的所有 TravelCard 记录，然后重新导入数据。
                此操作不可撤销，确定要继续吗？
              </AlertDialog.Description>

              <XStack gap="$3" justifyContent="flex-end">
                <AlertDialog.Cancel asChild>
                  <Button variant="outlined">取消</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button theme="error" onPress={handleDeleteAndReimport}>
                    确认删除
                  </Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </YStack>
  )
}
