import { Controller } from "../interfaces/Controller";
import { Request, Response} from "express";
import { DataBase } from "../utils/DataBase";
import { LLMGenStory_1st_2nd } from "../utils/tools/LLMapi";
import { GenImg_prompt_En_array, GenImg_prompt_En } from "../utils/tools/images/LLM_fetch_images";
import { storyInterface } from "../interfaces/storyInterface";
import { fetchImage } from "../utils/tools/fetch";


export class StoryController extends Controller {
  public test(Request: Request, Response: Response) {
    Response.send(`this is STORY get, use post in this url is FINE !`);
  }

  //拿資料庫故事
  public GetStorylistFDB(Request: Request, Response: Response) {
    let { userId } = Request.query;
    console.log(`userId = ${userId}`);
    DataBase.getstoryList(userId as string).then((result) => {
      if (result.success){
        return Response.status(200).send(result.message);
      }else{
        return Response.status(403).send(result.message);
      }
    }).catch((e:any)=>{
      console.error(`GetStorylistFDB fail: ${e.message}`);
      return Response.status(400).send('GetStorylistFDB fail');
    });
  }


  public async LLMGenStory(Request: Request, Response: Response) {
    let storyInfo: string = Request.body.storyInfo;
    let generated_story_array: string[] | undefined;

    async function delayedExecution(): Promise<void> {
      console.log('Waiting for 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 等待 5 秒鐘
    }

    let generated_imageprompt_array: string[] = [];
    let Saved_storyID: string = "";

    // 用故事內容生成故事圖片prompt
    const GenImagePrompt = async (generated_story_array: string[], _id:string): Promise<void> => {
      if (generated_story_array) {
        generated_imageprompt_array = await GenImg_prompt_En_array(generated_story_array);
        await DataBase.Update_StoryImagePrompt(_id, generated_imageprompt_array);
      }
    };

    const GenImage = async (generated_story_image_prompt: Array<string>, _id:string):Promise<any> =>{
      let generated_imagebase64_array:string[] = [];
      for(let i=0; i<generated_story_image_prompt.length; i++){
        let payload:Object = {
          "prompt": generated_story_image_prompt[i],
          "seed": -1,
          "cfg_scale": 7,
          "step": 2,
          "enable_hr": false,
          "denoising_strength": 100,
          "restore_faces": false,
        }
        fetchImage(payload).then((image_base64:string)=>{
          generated_imagebase64_array.push(image_base64);
        });
        await new Promise(resolve => {
          console.log(`(fetchImage) wait 3 seconds...`);
          setTimeout(resolve, 3000);
        });
      }
      DataBase.Update_StoryImage_Base64(_id, generated_imagebase64_array);
    };

    // 生成故事內容
    const generateStory = async (storyInfo: string): Promise<void> => {
      Saved_storyID = await LLMGenStory_1st_2nd(storyInfo, Response);
      const story:storyInterface = await DataBase.getStoryById(Saved_storyID);
      generated_story_array = story.storyTale.split("\n");
      delayedExecution();
      // 生成故事圖片提示詞
      await GenImagePrompt(generated_story_array || [] , Saved_storyID);
      const generated_story_image_prompt = story.image_prompt;
      await GenImage(generated_story_image_prompt!, Saved_storyID)
    };


    const promises = [
      generateStory(storyInfo),
    ];

    try {
      await Promise.all(promises);
      // 所有異步操作完成後，回傳成功的狀態碼
      return Response.status(200).send('All operations have been completed successfully');
    } catch (error) {
      console.error(`Error in LLMGenStory: ${error}`);
      return Response.status(500).send('Internal Server Error');
    }
  }

  public async genimageprompt(Request:Request, Response:Response){
    const story_slice = Request.body.story_slice!;
    const res= await GenImg_prompt_En(story_slice);
    Response.send(`res = ${res}`);
  }

}