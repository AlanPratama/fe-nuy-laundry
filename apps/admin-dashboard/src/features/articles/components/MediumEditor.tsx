import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useArticleStore } from '../providers/useArticleStore'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { useToast } from '../../../components/ui/Toast'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Quote, 
  List, 
  ListOrdered, 
  Minus, 
  Link2, 
  Undo2, 
  Redo2,
  Terminal,
  Image as ImageIcon,
  ChevronDown,
  Check,
  X,
  ExternalLink,
  UploadCloud,
  Loader2,
  Unlink
} from 'lucide-react'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

// Reusable Toolbar Button with Instant Beautiful Hover Tooltip
interface ToolbarBtnProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  tooltip: string
  shortcut?: string
  children: React.ReactNode
}

const ToolbarBtn: React.FC<ToolbarBtnProps> = ({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  shortcut,
  children
}) => {
  return (
    <div className="relative group inline-flex items-center">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`p-2 rounded-xl transition duration-150 flex items-center justify-center ${
          isActive
            ? 'bg-brand-600 text-white font-bold shadow-xs'
            : 'text-ink-soft hover:bg-brand-50 hover:text-ink'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        {children}
      </button>

      {/* Tooltip Popup */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 transition-all opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-95 duration-150">
        <div className="bg-ink text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1.5 border border-white/10">
          <span>{tooltip}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-mono font-bold tracking-wider text-slate-200">
              {shortcut}
            </kbd>
          )}
        </div>
        <div className="w-2 h-2 bg-ink rotate-45 -mt-1 shadow-xs" />
      </div>
    </div>
  )
}

const HEADING_OPTIONS = [
  { level: 0, label: 'Teks Biasa (P)', tag: 'p' },
  { level: 1, label: 'Judul 1 (H1 - Utama)', tag: 'h1' },
  { level: 2, label: 'Judul 2 (H2 - Besar)', tag: 'h2' },
  { level: 3, label: 'Judul 3 (H3 - Sedang)', tag: 'h3' },
  { level: 4, label: 'Judul 4 (H4 - Kecil)', tag: 'h4' },
  { level: 5, label: 'Judul 5 (H5 - Sub-judul)', tag: 'h5' },
  { level: 6, label: 'Judul 6 (H6 - Label)', tag: 'h6' }
]

export const MediumEditor: React.FC<Props> = ({
  content,
  onChange,
  placeholder = 'Tuliskan cerita atau tips perawatan pakaian Anda di sini...'
}) => {
  const { uploadContentImage } = useArticleStore()
  const { success: toastSuccess, error: toastError } = useToast()

  // Modals & Popovers state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [linkNewTab, setLinkNewTab] = useState(true)
  const [isHeadingMenuOpen, setIsHeadingMenuOpen] = useState(false)

  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const headingMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  // Close heading dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headingMenuRef.current && !headingMenuRef.current.contains(e.target as Node)) {
        setIsHeadingMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Process & upload image file
  const handleUploadAndInsertFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toastError('Berkas yang dipilih harus berupa gambar (JPG, PNG, WebP).')
      return
    }

    setIsUploadingImage(true)
    try {
      // Upload via backend API
      const remotePath = await uploadContentImage(file)
      const fullUrl = resolveImageUrl(remotePath)
      
      editor?.chain().focus().setImage({ src: fullUrl }).run()
      toastSuccess('Gambar berhasil disisipkan ke artikel!')
      setIsImageModalOpen(false)
    } catch (err: any) {
      // Fallback: convert to base64 Data URL so user never loses their inserted image
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          editor?.chain().focus().setImage({ src: e.target.result }).run()
          toastSuccess('Gambar disisipkan (pratinjau lokal)!')
          setIsImageModalOpen(false)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const openLinkModalRef = useRef<() => void>(() => {})

  // Custom Link Extension with Mod-k shortcut binding
  const CustomLink = Link.extend({
    addKeyboardShortcuts() {
      return {
        'Mod-k': () => {
          openLinkModalRef.current()
          return true
        }
      }
    }
  })

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      CustomLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-600 underline cursor-pointer'
        }
      }),
      Image.configure({
        allowBase64: true,
        inline: false,
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-6 shadow-soft mx-auto border border-brand-100/60'
        }
      })
    ],
    content,
    editorProps: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || [])
        const imageItem = items.find((item) => item.type.startsWith('image/'))
        if (imageItem) {
          event.preventDefault()
          const file = imageItem.getAsFile()
          if (file) {
            handleUploadAndInsertFile(file)
          }
          return true
        }
        return false
      },
      handleDrop(view, event, slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleUploadAndInsertFile(file)
            return true
          }
        }
        return false
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  // Open Link Modal
  const openLinkModal = useCallback(() => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const selected = editor.state.doc.textBetween(from, to, ' ')
    const previousUrl = editor.getAttributes('link').href || ''
    const previousTarget = editor.getAttributes('link').target

    setLinkText(selected || '')
    setLinkUrl(previousUrl || '')
    setLinkNewTab(previousTarget === '_blank' || !previousUrl)
    setIsLinkModalOpen(true)

    setTimeout(() => {
      urlInputRef.current?.focus()
      urlInputRef.current?.select()
    }, 50)
  }, [editor])

  useEffect(() => {
    openLinkModalRef.current = openLinkModal
  }, [openLinkModal])

  // Apply Link
  const applyLink = useCallback(() => {
    if (!editor) return

    const trimmedUrl = linkUrl.trim()

    if (!trimmedUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setIsLinkModalOpen(false)
      return
    }

    // Format protocol if missing
    let finalUrl = trimmedUrl
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl) && !/^tel:/i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`
    }

    // If text was edited or selection was empty
    const { from, to } = editor.state.selection
    const currentSelected = editor.state.doc.textBetween(from, to, ' ')

    if (linkText.trim() && linkText.trim() !== currentSelected) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: linkText.trim(),
          marks: [
            {
              type: 'link',
              attrs: {
                href: finalUrl,
                target: linkNewTab ? '_blank' : null,
                class: 'text-brand-600 underline cursor-pointer'
              }
            }
          ]
        })
        .run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: finalUrl,
          target: linkNewTab ? '_blank' : null
        })
        .run()
    }

    setIsLinkModalOpen(false)
  }, [editor, linkUrl, linkText, linkNewTab])

  // Remove Link
  const removeLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setIsLinkModalOpen(false)
  }, [editor])

  // Global keydown listener for Ctrl+K / Cmd+K inside editor container
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      e.stopPropagation()
      openLinkModal()
    }
  }

  // Determine currently active heading level
  const getCurrentHeadingLabel = () => {
    if (!editor) return 'Teks Biasa (P)'
    for (let level = 1; level <= 6; level++) {
      if (editor.isActive('heading', { level })) {
        return `Judul ${level} (H${level})`
      }
    }
    return 'Teks Biasa (P)'
  }

  const setHeadingOrParagraph = (level: number) => {
    if (!editor) return
    if (level === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().setHeading({ level: level as any }).run()
    }
    setIsHeadingMenuOpen(false)
  }

  if (!editor) {
    return (
      <div className="w-full min-h-[300px] flex items-center justify-center text-ink-soft bg-white rounded-3xl border border-brand-50 shadow-soft">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600 mr-2" />
        <span className="text-sm font-semibold">Menyiapkan editor Medium...</span>
      </div>
    )
  }

  return (
    <div className="relative w-full" onKeyDown={handleContainerKeyDown}>
      {/* Sticky Medium-Style Formatting Toolbar */}
      <div className="sticky top-20 z-20 mb-6 bg-white/95 backdrop-blur-md border border-brand-100/90 shadow-card rounded-2xl p-2 flex flex-wrap items-center gap-1 max-w-full">
        {/* Headings Dropdown Select */}
        <div className="relative" ref={headingMenuRef}>
          <button
            type="button"
            onClick={() => setIsHeadingMenuOpen(!isHeadingMenuOpen)}
            className="px-3 py-1.5 rounded-xl border border-brand-100 bg-brand-50/50 hover:bg-brand-100/70 text-ink text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Pilih Format Judul / Paragraf"
          >
            <span>{getCurrentHeadingLabel()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-soft" />
          </button>

          {isHeadingMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-brand-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft border-b border-brand-50 mb-1">
                Format Teks & Judul
              </div>
              {HEADING_OPTIONS.map((item) => {
                const isSelected = item.level === 0
                  ? editor.isActive('paragraph') && !editor.isActive('heading')
                  : editor.isActive('heading', { level: item.level })

                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setHeadingOrParagraph(item.level)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-brand-50 text-brand-600 font-bold'
                        : 'text-ink hover:bg-brand-50/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-brand-100 mx-1" />

        {/* Text Formats */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="Tebal"
          shortcut="Ctrl+B"
        >
          <Bold className="w-4 h-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="Miring"
          shortcut="Ctrl+I"
        >
          <Italic className="w-4 h-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          tooltip="Coretan"
          shortcut="Ctrl+Shift+X"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          tooltip="Kode Inline"
          shortcut="Ctrl+E"
        >
          <Code className="w-4 h-4" />
        </ToolbarBtn>

        <div className="w-[1px] h-5 bg-brand-100 mx-1" />

        {/* Block Elements */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          tooltip="Kutipan / Blockquote"
          shortcut="Ctrl+Shift+B"
        >
          <Quote className="w-4 h-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          tooltip="Daftar Poin"
          shortcut="Ctrl+Shift+8"
        >
          <List className="w-4 h-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          tooltip="Daftar Berurutan"
          shortcut="Ctrl+Shift+7"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          tooltip="Blok Kode Program"
          shortcut="Ctrl+Alt+C"
        >
          <Terminal className="w-4 h-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Garis Pemisah (Divider)"
        >
          <Minus className="w-4 h-4" />
        </ToolbarBtn>

        <div className="w-[1px] h-5 bg-brand-100 mx-1" />

        {/* Custom Link Button */}
        <ToolbarBtn
          onClick={openLinkModal}
          isActive={editor.isActive('link')}
          tooltip="Sisipkan Tautan"
          shortcut="Ctrl+K"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarBtn>

        {/* Insert Image Button */}
        <ToolbarBtn
          onClick={() => setIsImageModalOpen(true)}
          tooltip="Sisipkan Gambar (Paste / Upload)"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarBtn>

        <div className="w-[1px] h-5 bg-brand-100 mx-1" />

        {/* History */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Batalkan (Undo)"
          shortcut="Ctrl+Z"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Ulangi (Redo)"
          shortcut="Ctrl+Y"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      {/* Editor Content Canvas */}
      <div className="min-h-[450px] focus:outline-none">
        <EditorContent editor={editor} />
      </div>

      {/* CUSTOM LINK MODAL / DIALOG */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsLinkModalOpen(false)}
          />
          <div className="min-h-full flex items-center justify-center p-4 text-center">
            <div 
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Sisipkan Tautan (Link)</h4>
                    <p className="text-[11px] text-ink-soft">Atur URL tujuan dan teks tautan</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-brand-50 hover:bg-brand-100 text-ink-soft hover:text-ink grid place-items-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  applyLink()
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Teks Tautan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Teks yang akan ditampilkan..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600 bg-brand-50/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    URL Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={urlInputRef}
                      type="text"
                      required
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://contoh-website.com/artikel"
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600 bg-white"
                    />
                    {linkUrl && (
                      <a
                        href={linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-brand-600"
                        title="Buka link untuk verifikasi"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-ink-soft mt-1">
                    Gunakan awalan https:// atau domain tujuan. Shortcut: <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded">Ctrl+K</kbd> / <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded">Cmd+K</kbd>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="linkNewTabCheck"
                    checked={linkNewTab}
                    onChange={(e) => setLinkNewTab(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-brand-200 cursor-pointer"
                  />
                  <label htmlFor="linkNewTabCheck" className="text-xs font-semibold text-ink cursor-pointer">
                    Buka tautan di tab baru (<code className="font-mono text-[10px] text-brand-600">target="_blank"</code>)
                  </label>
                </div>

                <div className="pt-3 border-t border-brand-50 flex items-center justify-between gap-2">
                  {editor.isActive('link') ? (
                    <button
                      type="button"
                      onClick={removeLink}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Hapus Tautan</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLinkModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-soft active:scale-95 transition"
                    >
                      Terapkan Tautan
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM IMAGE INSERT MODAL */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isUploadingImage && setIsImageModalOpen(false)}
          />
          <div className="min-h-full flex items-center justify-center p-4 text-center">
            <div 
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Sisipkan Gambar ke Artikel</h4>
                    <p className="text-[11px] text-ink-soft">Upload berkas atau tempel link gambar</p>
                  </div>
                </div>
                {!isUploadingImage && (
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-brand-50 hover:bg-brand-100 text-ink-soft hover:text-ink grid place-items-center transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-brand-50/70 rounded-xl my-4">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    imageTab === 'upload'
                      ? 'bg-white text-brand-600 shadow-xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Upload dari Perangkat
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    imageTab === 'url'
                      ? 'bg-white text-brand-600 shadow-xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Tautan URL
                </button>
              </div>

              {imageTab === 'upload' ? (
                <div className="space-y-4">
                  <div
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    className="py-10 px-4 rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-600 hover:bg-brand-50/20 transition-all flex flex-col items-center justify-center cursor-pointer text-center group"
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
                        <span className="text-xs font-bold text-ink">Mengunggah gambar ke MinIO...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mb-2 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-ink">Pilih Berkas Gambar dari Komputer</span>
                        <span className="text-[10px] text-ink-soft mt-1">Format JPG, PNG, atau WebP</span>
                      </>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadAndInsertFile(file)
                    }}
                  />

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                    💡 <strong>Tips Pintar:</strong> Anda juga bisa langsung <strong>copy gambar</strong> lalu tekan <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">Ctrl+V</kbd> / <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">Cmd+V</kbd> di dalam editor untuk paste instan!
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (imageUrl.trim()) {
                      editor.chain().focus().setImage({ src: imageUrl.trim() }).run()
                      toastSuccess('Gambar berhasil disisipkan!')
                      setIsImageModalOpen(false)
                      setImageUrl('')
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      URL Gambar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://contoh.com/foto.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-soft transition"
                    >
                      Sisipkan Gambar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
