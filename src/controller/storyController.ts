import { Controller } from "../interfaces/Controller";
import { Request, Response, response } from "express";
import { AiStory } from "../utils/opanaiApi";
import { DataBase } from "../utils/DataBase";
import { books } from "../interfaces/books";
import { LLMGenStory } from "../utils/LLMapi";

export class StoryController extends Controller {
  public test(Request: Request, Response: Response) {
    Response.send(`this is STORY get, use post in this url is FINE !`);
    // DataBase.getStoryById("653b89626620dbe005b01bc6").then((storytail)=>{
    // })
  }


  public GenerStory(Request: Request, Response: Response) {
    let infoVal = Request.body;
    let storyInfo = Request.body.storyInfo;
    console.log(`Request.body.storyInfo = ${Request.body.storyInfo}`)
    // console.log(`infoVal= ${JSON.stringify(infoVal)}`)
    //生成故事
    AiStory(infoVal).then((storyTale: string) => {
      DataBase.SaveNewStory(storyTale, storyInfo)
      Response.send(`story gener ans save success`);
    })
  }

  //拿資料庫故事
  public GeyStoryFDB(Request: Request, Response: Response) {
    let data = Request.query.id;
    DataBase.getStoryById(data as string).then((storytail) => {
      // console.log(`storytail = ${storytail}`)
      Response.send(storytail)
    })
  }

  //拿最新創建的故事id
  public GetNewestStoryID(Request: Request, Response: Response) {
    DataBase.getNewestId().then((newestId: string) => {
      Response.send(newestId);
    }).catch((e) => {
      console.log(` GetNewestStoryID fail :${e}`);
    })
  }

  //拿整理好的books (storyId: string; storyName: string;)
  public GetBooks(Request:Request, Response:Response){
    DataBase.getBooks().then((books:books[])=>{
      Response.send(JSON.stringify(books));
    })
  }

  // 拿故事列表(全部)



  //llm generation story
  public llmgenStory(Request:Request, Response:Response){
    LLMGenStory().then(response=>{
      Response.send(response);
    }).catch(e=>{
      console.error(`llmgenStory fail: ${e}`);
    });
  }

}