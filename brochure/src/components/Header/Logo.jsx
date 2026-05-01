import React from 'react'
import Image from 'next/image'
import logo from '../../../public/assets/logo.svg'

const Logo = () => <Image src={logo} alt="Logo" width={50} height={50} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

export default Logo
