import { AssetId, ContentId } from '../cms'
import * as nlp from '../nlp'
import { ContentFieldType } from './fields'
import { ManageContext } from './manage-context'

export interface FieldsValues {
  [contentFieldType: string]: any
}

/**
 * Take into account that if you request a content immediately after updating it
 * you might get the old version
 */
export interface ManageCms {
  updateFields(
    context: ManageContext,
    contentId: ContentId,
    fields: FieldsValues
  ): Promise<FieldsValues>

  /** Will not fail if source does not have this field */
  copyField(
    context: ManageContext,
    contentId: ContentId,
    field: ContentFieldType,
    fromLocale: nlp.Locale,
    onlyIfTargetEmpty: boolean
  ): Promise<void>

  copyAssetFile(
    context: ManageContext,
    assetId: AssetId,
    fromLocale: nlp.Locale
  ): Promise<void>

  removeAssetFile(context: ManageContext, assetId: AssetId): Promise<void>
}
