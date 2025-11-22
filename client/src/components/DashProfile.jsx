import { Alert, Button, Modal, ModalBody, ModalHeader, TextInput } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateFailure, updateStart, updateSuccess, deleteUserFailure, deleteUserStart, deleteUserSuccess, signoutSuccess } from '../redux/user/userSlice'
import {HiOutlineExclamationCircle} from 'react-icons/hi'
import { Link } from 'react-router-dom'

export default function DashProfile() {
  const {currentUser, error, loading} = useSelector(state => state.user)
  const [imageFile, setImageFile] = useState(null)
  const [imageFileUrl, setImageFileUrl] = useState(null)
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null)
  const [imageFileUploading, setImageFileUploading] = useState(false)
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null)
  const [updateUserError, setUpdateUserError] = useState(null)
  const [showModal, setShowModal] = useState(false)


  const [formData, setFormData] = useState({})
  const filePickerRef = useRef()

  const dispatch = useDispatch()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file){
      setImageFile(file)
      setImageFileUrl(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    if(imageFile){
      uploadImage()
    }
  }, [imageFile])
  
  console.log(currentUser)

  const uploadImage = async () => {
  // service firebase.storage {
  //   match /b/{bucket}/o {
  //     match /{allPaths=**} {
  //       allow read;
  //       allow write: if 
  //       request.resource.size < 2 * 1024 * 1024 &&
  //       request.resource.contentType.matches('image/.*')
  //     }
  //   }
  // }
    setImageFileUploading(true)
    setImageFileUploadError(null)
    const storage = getStorage(app)
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = 
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError('No se pudo subir la imagen (debe de ser menos de 2MB)')
        setImageFileUploadProgress(null)
        setImageFile(null)
        setImageFileUrl(null)
        setImageFileUploading(false)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL)
          setFormData({...formData, profilePicture: downloadURL})
          setImageFileUploading(false)
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null)
    setUpdateUserSuccess(null)
    if (Object.keys(formData).length === 0){
      console.log(formData)
      setUpdateUserError('No se ha modificado ningun elemento')
      return;
    }
    if(imageFileUploading){
      setUpdateUserError('Espera hasta que la imagen haya cargado')
      return;
    }
    try {
      console.log("FormDAta")
      console.log(formData)
      dispatch(updateStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json()
      console.log("Data")
      console.log(data)
      if(!res.ok){
        dispatch(updateFailure(data.message))
        setUpdateUserError(data.message)
      } else {
        dispatch(updateSuccess(data))
        setUpdateUserSuccess("Se ha actualizado el perfil")
      }
    } catch (error) {
      dispatch(updateFailure(error.message))
    }
  }

  const handelDeleteUser = async () => {
    setShowModal(false)
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json()
      if(!res.ok){
        dispatch(deleteUserFailure(data.message))
      } else {
        dispatch(deleteUserSuccess(data))
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json()
      if(!res.ok){
        console.log(error.message)
      } else {
        dispatch(signoutSuccess())
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl'>profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="file" accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden />
        <div className='relative w-32 h-32 self-center cursor-pointer shadow-md rounded-full' onClick={() => filePickerRef.current.click() } >
          {imageFileUploadProgress && (
            <CircularProgressbar value={imageFileUploadProgress || 0} text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root:{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${imageFileUploadProgress / 100})`
                }
              }}
            />
          )}

          <img src={imageFileUrl || currentUser.profilePicture} alt="user" className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] 
            ${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60'}`}/>
        </div>

        {imageFileUploadError && <Alert color='failure'>{imageFileUploadError}</Alert>}

        <TextInput type='text' id='username' placeholder='username' defaultValue={currentUser.username} onChange={handleChange}/>
        <TextInput type='email' id='email' placeholder='email' defaultValue={currentUser.email} onChange={handleChange}/>
        {/* <TextInput type='password' id='password' placeholder='password' onChange={handleChange}/> */}

        <Button disabled={loading || imageFileUploading} type='submit' className='focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900'>
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
        {
          currentUser.isAdmin && (
            <Link to={'/create-post'}>
              <Button type='button' className='w-full'>
                Crear un post
              </Button>
            </Link>
          )
        }
      </form>

      <div className='text-red-500 flex justify-between mt-5'>
        {/* <span onClick={() => setShowModal(true)} className='cursor-pointer'>Borrar Cuenta</span> */}
        <span onClick={handleSignout} className='cursor-pointer'>Cerrar sesion</span>
      </div>
      {updateUserSuccess && (
        <Alert color='success' className='mt-5'>
          {updateUserSuccess || updateUserError}
        </Alert>
      )}

      {updateUserError && (
        <Alert color='failure' className='mt-5'>
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color='failure' className='mt-5'>
          {error}
        </Alert>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto'/>
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Estas seguro que quieres eliminar tu cuenta?</h3>
            <div className="flex justify-center gap-4">
              <Button color='red' onClick={handelDeleteUser}>
                Si
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

    </div>
  )
}
