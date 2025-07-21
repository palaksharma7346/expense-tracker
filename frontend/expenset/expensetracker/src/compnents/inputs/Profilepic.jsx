import React, { useRef, useState } from 'react'
import { LuUser,LuUpload,LuTrash } from 'react-icons/lu';
const Profilepic = ({ image, setImage }) => {
    const inputRef = useRef(null);
    const [previewurl, setPreviewUrl] = useState(null);
    const handleImageCHange = (event)=>{
        const file = event.target.files[0];
        if(file){
            setImage(file);
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        }
    }
    const handleRemoveImage = ()=>{
        setImage(null);
        setPreviewUrl(null);
    }
    const onChooseFile = ()=>{
        inputRef.current.click();
    }
  return (
    <div className='flex justify-center  mb-6'>
      <input type='file'
      accept='image/*'
      ref={inputRef}
      onChange={handleImageCHange}
        className='hidden'
      >
      </input>
      {!image ? (
        <div className='w-16 h-16 rounded-full bg-[#D4A373] border border-solid border-gray-400 flex items-center justify-center cursor-pointer relative' >
          <LuUser className='text-gray-500 text-3xl' />
            <button type="button" onClick={onChooseFile} className='w-8 h-8 bg-[#6B3E1F] text-white rounded-full absolute -bottom-1 right-0 flex items-center justify-center'>
                <LuUpload />
            </button>
        </div>
      ) : (
        <div className=''>
          <img src={previewurl} alt="Profile" className='w-20 h-20 rounded-full object-cover' />
          <button type='button' onClick={handleRemoveImage} className='w-8 h-8 bg-red-500 text-white rounded-full absolute -bottom-1 right-1 flex items-center justify-center'>
            <LuTrash />
          </button>
        </div>
      )}
    </div>
  )
}

export default Profilepic
