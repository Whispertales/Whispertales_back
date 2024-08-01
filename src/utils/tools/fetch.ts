import dotenv from 'dotenv';
dotenv.config();

export const fetchImage = async (payload:Object) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };
    try {
        const response = await fetch(`${process.env.stable_diffusion_api}/sdapi/v1/txt2img`, requestOptions);
        const data = await response.json();
        return data.images; //只回傳image Base64 code
    } catch (error) {
        console.error(`fetchImage fail: ${error}`);
        throw error;
    }
};


/**
 * 更改sd option，使用想要的模型生成圖片
 * @param MODEL_NAME 要使用的sd 模型名稱
 */
export const sdModelOption = async (MODEL_NAME:string) =>{
    try {
        const response = await fetch(`${process.env.stable_diffusion_api}/sdapi/v1/options`);
        if (!response.ok) {
            throw new Error(`sd get options error! status: ${response.status}`);
            // return { code: 403, message: `sd get options error! status: ${response.status}`};
        }

        const opt_json = await response.json();
        // console.log(`response = ${JSON.stringify(opt_json)}`);
        opt_json["sd_model_checkpoint"] = MODEL_NAME;

        const updateOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(opt_json),
        };

        const updateResponse = await fetch(`${process.env.stable_diffusion_api}/sdapi/v1/options`, updateOptions);
        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
        return { code: 200, message:`Model option updated successfully`}
        // console.log('Model option updated successfully');
    } catch (error: any) {
        // console.error(`Error in sdModelOption: ${error.message}`);
        return { code: 405, message: `Error in sdModelOption: ${error.message}` };
    }
}

export const getSDModelList = async () => {
    try {
        const response = await fetch(`${process.env.stable_diffusion_api}/sdapi/v1/sd-models`);
        if (!response.ok) {
            throw new Error(`sd get models error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error(`Error in getSDModelList: ${error.message}`);
        throw new Error(`getSDModelList error! status: ${error.message}`);
    }
}

export const getVoices = async (Saved_storyID: string, storyTale: string): Promise<{ audioFileName: string, audioBuffer: ArrayBuffer }> => {
    const url = `http://163.13.202.120:9880/?text=${encodeURIComponent(storyTale)}&text_language=zh`;
    try {
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const audioBuffer = await response.arrayBuffer();
        const audioFileName = `Saved_${Saved_storyID}.wav`;
        return { audioFileName, audioBuffer };
    } catch (error) {
        console.error("Error fetching voice:", error);
        throw error;
    }
}


// //http://163.13.202.120:8188/prompt
// const useComfy3D = `http://163.13.202.120:8188/prompt`
// export const fetchComfy = async(prompt:any) => {
//     const requestOptions = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(prompt)
//     };
//     try {
//         const response = await fetch(`${useComfy3D}`, requestOptions);
//         const data = await response.json();
//         return data.images; 
//     } catch (error) {
//         console.log(`Error fetchImage response is ${error}`);
//         return `Error => no return `;
//     }
// }


