import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import TipTap from "../components/TipTap";
import { useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from "../firebase";
import { CircularProgressbar, buildStyles  } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [file, setFile] = useState(null)
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null)
  const [formData, setFormData] = useState({})
  const [editorContent, setEditorContent] = useState('');
  const [publishError, setPublishError] = useState(null)

  const navigate = useNavigate()

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
      const res = await fetch('/api/post/create', {
        method: 'POST',
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
      <h1 className="text-center text-3xl my-7 font-semibold">Crea un post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput type="text" placeholder="Titulo" required id="title" className="flex-1" 
          onChange={(e) => 
            setFormData({...formData, title: e.target.value})
          }/>
          
          <Select onChange={(e) => setFormData({ ...formData, category: e.target.value })} >
            <option value=''>Sin categoria</option>
            <option value='CivilizacionesAntiguas'>Civilizaciones Antiguas</option>
            <option value='GuerrasyRevoluciones'>Guerras y Revoluciones</option>
            <option value='PersonajesHistoricos'>Personajes Históricos</option>
            <option value='HistoriadeMexico'>Historia de México</option>
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
        { formData.image && (
          <img src={formData.image} alt="imagen" className="w-full h-72 object-cover"/>
        ) }
          <TipTap onContentChange={setEditorContent} />
          <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id="isExclusive"
                checked={formData.isExclusive || false}
                onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })}
                className="w-4 h-4"
            />
            <label htmlFor="isExclusive" className="text-sm text-gray-700 dark:text-gray-300">
              Este artículo es exclusivo
            </label>
          </div>
          <Button type="submit" className="my-10">Publicar articulo</Button>
          { publishError && <Alert color="failure">{publishError}</Alert> }
      </form>
    </div>
  )
}
