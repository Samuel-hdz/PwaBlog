import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Modal, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Button, ModalHeader, ModalBody } from 'flowbite-react'
import { Link } from 'react-router-dom'
import {HiOutlineExclamationCircle} from 'react-icons/hi'
import { FaCheck, FaTimes } from "react-icons/fa"

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user)
  const [users, setUsers] = useState([])
  const [showMore, setShowMore] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState('')
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/user/getusers`)
        const data = await res.json();
        if (res.ok){
          setUsers(data.users)
          if(data.users.length < 9){
            setShowMore(false)
          }
        }
      } catch (error) {
        console.log(error.message)
      }
    };
    if (currentUser.isAdmin){
      fetchUsers()
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`)
      const data = await res.json()
      if(res.ok){
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9){
          setShowMore(false)
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  console.log(users)

  const handelDeleteUser = async() =>  {
    try {
        const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
            method: 'DELETE'
        });
        const data = await res.json()
        if (res.ok){
            setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete))
            setShowModal(false)
        }
    } catch (error) {
        console.log(error.message)
    }
  }

  return <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar
  scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700
  dark:scrollbar-thumb-slate-500'>
    { currentUser.isAdmin && users.length > 0 ? (
      <>
        <Table hoverable className='shadow-md'>
          <TableHead>
            <TableRow>
              <TableHeadCell>Date updated</TableHeadCell>
              <TableHeadCell>User image</TableHeadCell>
              <TableHeadCell>Username</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Admin</TableHeadCell>
              <TableHeadCell>Delete</TableHeadCell>
            </TableRow>
          </TableHead>
          { users.map((user) => (
            <TableBody className='divide-y' key={user._id}>
              <TableRow className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                    <img 
                      src={user.profilePicture}
                      alt={user.username}
                      className='w-10 h-10 object-cover bg-gray-500 rounded-full' />
                </TableCell>
                <TableCell>
                  {user.username}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.isAdmin ? (<FaCheck className='text-green-500' />) : (<FaTimes className='text-red-500' />)}</TableCell>
                <TableCell>
                  <span onClick={ () => { 
                    setShowModal(true)
                    setUserIdToDelete(user._id)
                   } } className='text-red-500 hover:underline cursor-pointer'>
                    Delete
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          ))}
        </Table>
        {
          showMore && (
            <button onClick={handleShowMore} className='w-full text-teal-500 self-center text-sm py-7'>
              Ver mas
            </button>
          )
        }
      </>
    ):(
      <p>Aun no hay ningun usuario</p>
    ) }

    <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto'/>
          <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Estas seguro que quieres eliminar este usuario?</h3>
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
}
