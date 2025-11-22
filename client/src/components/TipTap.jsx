import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './TipTap.css'
import Toolbar from "./Toolbar"
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'

export default function TipTap({ onContentChange, initialContent = '' }) {
    const editor = useEditor({
        extensions: [StarterKit.configure({
          link:{
            openOnClick: false,
            autolink: true
          }
        }), Image, Placeholder.configure({
          placeholder: 'Ecribe algo...'
        })],
        content: initialContent,
        onUpdate({ editor }) {
          const html = editor.getHTML()
          onContentChange(html)
        }
    });

    const editorState = useEditorState({
      editor,
      selector: (ctx) => {
        return {
          idBold: ctx.editor.isActive('bold'),
          isItalic: ctx.editor.isActive('italic'),
          isUnderline: ctx.editor.isActive('underline'),
          isCodeBlock: ctx.editor.isActive('codeBlock'),
          isHeading1: ctx.editor.isActive('heading', { level: 1 }),
          isHeading2: ctx.editor.isActive('heading', { level: 2 }),
          isHeading3: ctx.editor.isActive('heading', { level: 3 }),
          isParagraph: ctx.editor.isActive('paragraph'),
          isOrderedList: ctx.editor.isActive('orderedList'),
          isBulletList: ctx.editor.isActive('bulletList'),
          isImage: ctx.editor.isActive('image'),
          isLink: ctx.editor.isActive('link')
        };
      },
    })

    const comandos = {
      toggleBold: () => editor.chain().focus().toggleBold().run(),
      toggleItalic: () => editor.chain().focus().toggleItalic().run(),
      toggleUnderline: () => editor.chain().focus().toggleUnderline().run(),
      toggleCodeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
      toggleH1: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      toggleH2: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      toggleH3: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      toggleParrafo: () => editor.chain().focus().setParagraph().run(),
      toggleListaOrdenada: () => editor.chain().focus().toggleOrderedList().run(),
      toggleListaPuntos: () => editor.chain().focus().toggleBulletList().run(),
      // agregarImagen: () => {
      //   const anteriorURL = editor.getAttributes('link').href;
      //   const url = window.prompt('URL', anteriorURL);
      //   editor.chain().setImage({ src: url }).run()
      // },
      agregarLink: () => {
        const url = window.prompt('URL');
        editor.chain().setLink({ href: url }).run()
      },
      guardarContenido: () => {
        const contenido = editor.getHTML();
        console.log(contenido)
      }
    }

  return (
    <>
        <Toolbar comandos={comandos} editorState={editorState} />
        <main>
          <EditorContent editor={editor} />
        </main>
    </>
  )
}
