import React from 'react'

const CustomTooltip = (active, payload) => {
    if(active && payload && payload.length){
        return (
            <div className='bg-white p-2 border border-gray-300 rounded-lg shadow-md'>
                <p className='text-xs font-semibold text-black mb-1'>{payload[0].name}</p>
                <p className='text-sm text-gray-700'>
                    Amount : <span className='text-sm font-medium text-grar-500'>${payload[0].value}</span>
                </p>
            </div>
        )
    }
    return null;
}

export default CustomTooltip
