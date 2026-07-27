import { motion } from 'framer-motion'

// 通用的「页面传送」包装：进场放大浮现，退场缩小淡出
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
