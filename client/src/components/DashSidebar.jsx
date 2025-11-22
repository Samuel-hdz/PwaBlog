import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react'
import { HiAnnotation, HiArrowSmRight, HiChartPie, HiDocumentText, HiOutlineUserGroup, HiUser } from 'react-icons/hi'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signoutSuccess } from '../redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'

export default function DashSidebar() {
    const location = useLocation()
    console.log("location", location)
    const [tab, setTab] = useState('')
    const dispatch = useDispatch()

    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const tabFromUrl = urlParams.get('tab')
        if (tabFromUrl){
        setTab(tabFromUrl)
        }
    }, [location.search])

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
    <Sidebar className='w-full md:w-56'>
        <SidebarItems>
            <SidebarItemGroup className='flex flex-col gap-1'>

            {currentUser.isAdmin && (
                    <Link to='/dashboard?tab=dash'>
                      <SidebarItem
                        active={tab === 'dash' || !tab}
                        icon={HiChartPie}
                        as="div">
                          Dashboard
                      </SidebarItem>
                    </Link>
                  )}

                <Link to='/dashboard?tab=profile'>
                    <SidebarItem active={tab === 'profile'} icon={HiUser} label={currentUser.isAdmin ? "Admin" : "User"} labelColor='dark' as='div' >
                        Perfil
                    </SidebarItem>
                </Link>

                {currentUser.isAdmin && (
                    <Link to='/dashboard?tab=posts'>
                      <SidebarItem
                        active={tab === 'posts'}
                        icon={HiDocumentText}
                        as="div">
                          Articulos
                      </SidebarItem>
                    </Link>
                  )}

                  {currentUser.isAdmin && (
                    <Link to='/dashboard?tab=comments'>
                      <SidebarItem
                        active={tab === 'comments'}
                        icon={HiAnnotation}
                        as="div">
                          Comentarios
                      </SidebarItem>
                    </Link>
                  )}

                  {currentUser.isAdmin && (
                    <Link to='/dashboard?tab=users'>
                      <SidebarItem
                        active={tab === 'users'}
                        icon={HiOutlineUserGroup}
                        as="div">
                          Usuarios
                      </SidebarItem>
                    </Link>
                  )}

                <SidebarItem icon={HiArrowSmRight} className='cursor-pointer' onClick={handleSignout}>
                    Cerrar sesión
                </SidebarItem>
            </SidebarItemGroup>
        </SidebarItems>
    </Sidebar>
  )
}
