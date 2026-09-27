import { Link } from 'react-router-dom'
import { useEditMode } from '../../context/EditModeContext.jsx'

/**
 * 编辑按钮 —— 编辑模式下挂在板块页面角落
 * 点击跳到 /admin/:key 进行编辑（后台已登录才能保存）
 */
function EditButton({ sectionKey, label }) {
  const { editMode } = useEditMode()
  if (!editMode) return null

  return (
    <Link to={`/admin/${sectionKey}`} className="edit-fab" title={`编辑「${label}」`}>
      <span className="edit-fab-pen">✎</span>
      <span className="edit-fab-label">{label || '编辑'}</span>
    </Link>
  )
}

export default EditButton
