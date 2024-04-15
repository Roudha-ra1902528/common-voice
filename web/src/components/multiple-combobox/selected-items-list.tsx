import * as React from 'react'
import { useLocalization } from '@fluent/react'

import { CloseIcon } from '../ui/icons'
import VisuallyHidden from '../visually-hidden/visually-hidden'

type Props = {
  selectedItems: string[]
  removeItem: (item: string) => void
}

export const SelectedItemsList: React.FC<Props> = ({
  selectedItems,
  removeItem,
}) => {
  const { l10n } = useLocalization()

  return (
    <div className="selected-items-list">
      {selectedItems.map(item => (
        <span key={`domain-${item}`} className="selected-item">
          {l10n.getString(item)}
          <button
            className="selected-item--button"
            onClick={() => removeItem(item)}
            type="button">
            <VisuallyHidden>Remove {l10n.getString(item)}</VisuallyHidden>
            <CloseIcon black />
          </button>
        </span>
      ))}
    </div>
  )
}
