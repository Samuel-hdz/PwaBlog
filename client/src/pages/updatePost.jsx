import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import TipTap from "../components/TipTap";
import { useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from "../firebase";
import { CircularProgressbar, buildStyles  } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'

export default function UpdatePost() {
  const [file, setFile] = useState(null)
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null)
  const [formData, setFormData] = useState({})
  const [editorContent, setEditorContent] = useState('');
  const [publishError, setPublishError] = useState(null)
  const { postId } = useParams()

  const { currentUser } = useSelector(state => state.user)

  const navigate = useNavigate()

  console.log("first", formData)

  useEffect( () => {
    try {
        const fetchPost = async () => {
            const res = await fetch(`/api/post/getposts?postId=${postId}`)
            const data = await res.json()
            if(!res.ok){
                setPublishError(data.message)
                return
            }
            if(res.ok){
                setPublishError(null)
                setFormData(data.posts[0]);
            }
        }
        fetchPost()
    } catch (error) {
        console.log(error.message)
    }
  }, [postId])

  useEffect(() => {
    if (editorContent) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        content: editorContent
      }));
    }
  }, [editorContent]);
  

  const handleUploadImage = async () => {
    try {
      if(!file){
        setImageUploadError('Selecciona una imagen')
        return
      }
      setImageUploadError(null)
      const storage = getStorage(app)
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0))
        },
        (error) => {
          setImageUploadError('Hubo un error')
          setImageUploadProgress(null)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null)
            setImageUploadError(null)
            setFormData({ ...formData, image: downloadURL })
          })
        }
      )
    } catch (error) {
      setImageUploadError('Error al cargar la imagen')
      setImageUploadProgress(null)
      console.log(error)
    } 
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(!res.ok){
        setPublishError(data.message)
        return
      }

      if(res.ok){
        setPublishError(null)
        console.log("req", formData)
        navigate(`/post/${data.slug}`)
      }

    } catch (error) {
      setPublishError("Hubo un error")
    }
  }

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Actualiza el articulo</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput type="text" placeholder="Titulo" required id="title" value={formData.title || ''} className="flex-1" 
          onChange={(e) => 
            setFormData({...formData, title: e.target.value})
          }/>
          
          <Select onChange={(e) => setFormData({ ...formData, category: e.target.value })} value={formData.category} >
            <option value="uncategorized">Selecciona una categoria</option>
            <option value="javascript">1</option>
            <option value="reactjs">2</option>
            <option value="nextjs">3</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput type='file' accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <Button type="button" size="sm" className="p-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800" onClick={handleUploadImage} disabled={imageUploadProgress}>
            {
              imageUploadProgress ?
              <div className="w-8 h-8">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                  styles={buildStyles({
                    pathColor: '#17dc00', 
                    trailColor: '#fff',
                  })}
                />
              </div>
              : 'Cargar imagen'
            }
          </Button>
        </div>
        { imageUploadError && <Alert color="failure">{imageUploadError}</Alert> }
        { formData.image && (<img src={formData.image} alt="imagen" className="w-full h-72 object-cover"/>)}
        { formData.content && ( <TipTap onContentChange={setEditorContent} initialContent={formData.content} />)}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isExclusive"
            checked={formData.isExclusive || false}
            onChange={(e) =>
              setFormData({ ...formData, isExclusive: e.target.checked })
            }
            className="w-4 h-4"
          />
          <label htmlFor="isExclusive" className="text-sm text-gray-700 dark:text-gray-300">
            Este artículo es exclusivo
          </label>
        </div>
        <Button type="submit" className="my-10">Actualizar el articulo</Button>
        { publishError && <Alert color="failure">{publishError}</Alert> }
      </form>
    </div>
  )
}
