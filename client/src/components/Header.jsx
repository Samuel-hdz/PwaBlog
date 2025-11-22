import { Avatar, Button, Dropdown, Navbar, NavbarCollapse, NavbarLink, NavbarToggle, TextInput, DropdownHeader, DropdownItem, DropdownDivider} from 'flowbite-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AiOutlineSearch } from 'react-icons/ai'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import {toogleTheme} from '../redux/theme/themeSlice'
import { signoutSuccess } from '../redux/user/userSlice'
import { useEffect, useState } from 'react'

export default function Header() {
    const path = useLocation().pathname
    const location = useLocation()
    const { currentUser } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const { theme } = useSelector(state => state.theme)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()

    console.log("CURRENT", currentUser)

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const searchTermFromUrl = urlParams.get('searchTerm')
        if(searchTermFromUrl){
            setSearchTerm(searchTermFromUrl)
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

      const handleSubmit = (e) => {
        e.preventDefault()
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('searchTerm', searchTerm)
        const searchQuery = urlParams.toString()
        navigate(`/search?${searchQuery}`)
      }

  return (
    <Navbar className='border-b-2 flex flex-wrap items-center justify-between'>
    {/* Logo */}
    <Link to="/" className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
        <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
            Historika
        </span>
    </Link>

    {/* Search Form Centrado */}
    <div className="flex-1 flex justify-center order-1 mt-2 sm:mt-0">
        <form onSubmit={handleSubmit} className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl px-2">
            <TextInput
                type='text'
                placeholder='Search'
                rightIcon={AiOutlineSearch}
                className='inline w-full'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </form>
    </div>

    {/* Controles del usuario y botón de tema */}
    <div className='flex items-center gap-2  order-2'>
        {/* Botón de tema */}
        <Button className='w-12 h-10 hidden sm:inline' color='gray' pill onClick={() => dispatch(toogleTheme())}>
            {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button>

        {/* Suscríbete (sólo si no está suscrito) */}
        {currentUser && currentUser.isSubscribed === false && (
            <Link to="/suscribeteInfo" className="text-yellow-300 font-bold mx-4 text-sm hidden sm:inline">
                Suscríbete
            </Link>
        )}

        {/* Usuario o Sign In */}
        {currentUser ? (
            <Dropdown
                arrowIcon={false}
                inline
                label={<Avatar alt='user' img={currentUser.profilePicture} />}
                rounded
            >
                <DropdownHeader>
                    <span className='block text-sm'>@{currentUser.username}</span>
                    <span className='block text-sm font-medium truncate'>@{currentUser.email}</span>
                </DropdownHeader>

                <Link to={'/dashboard?tab=profile'}>
                    <DropdownItem>Perfil</DropdownItem>
                </Link>

                <DropdownDivider />

                <DropdownItem onClick={handleSignout}>Cerrar sesión</DropdownItem>
            </Dropdown>
        ) : (
            <Link to="/sign-in">
                <Button className="bg-gradient-to-br from-purple-600 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-blue-300 dark:focus:ring-blue-800">
                    Sign In
                </Button>
            </Link>
        )}

        <NavbarToggle />
    </div>
</Navbar>

  )
}
