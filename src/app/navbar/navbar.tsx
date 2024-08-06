import React from "react";
import Image from "next/image";
import Link from "next/link";
import taleweaver from "../taleweaver.png";
import WalletConnect from "../components/walletConnect";

const Navbar = () => {
  return (
    <nav className='flex items-center justify-between p-6 bg-gray-800'>
      <div className='flex items-center'>
        <Image src={taleweaver} alt='Logo' width={150} height={150} />
      </div>
      <div className='flex items-center'>
        <div className='mr-4'>
          <a href='/' className='text-white text-lg'>
            Home
          </a>
        </div>
        <div className='mr-4'>
          <a href='/about' className='text-white text-lg'>
            About
          </a>
        </div>
        <div className='mr-4'>
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
