import React from 'react'
import './typing-indicator.scss'
import { COLORS, ROLES } from '../../constants'

export const TypingIndicator = props => (
  <div
    role={ROLES.TYPING_INDICATOR}
    className='typing-indicator'
    style={{ backgroundColor: COLORS.SEASHELL_WHITE }}
  >
    <span />
    <span />
    <span />
  </div>
)
