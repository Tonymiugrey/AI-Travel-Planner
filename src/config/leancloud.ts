import AV from 'leancloud-storage'

// LeanCloud 配置
// 注意：这些应该从环境变量中读取，这里仅作为示例
const LEANCLOUD_CONFIG = {
  appId: 'HePdUgqszE7N3IsqpL2tyMaA-gzGzoHsz', // 替换为你的 LeanCloud App ID
  appKey: 'VN6MJNz8yMDBUbVNLXOFZRbb', // 替换为你的 LeanCloud App Key
  serverURL: 'https://hepdugqs.lc-cn-n1-shared.com' // 替换为你的 LeanCloud 服务器地址
}

// 初始化 LeanCloud
export const initLeanCloud = () => {
  AV.init({
    appId: LEANCLOUD_CONFIG.appId,
    appKey: LEANCLOUD_CONFIG.appKey,
    serverURL: LEANCLOUD_CONFIG.serverURL
  })
}

export { AV }
