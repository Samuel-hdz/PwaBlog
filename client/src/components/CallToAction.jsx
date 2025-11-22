import { Button } from "flowbite-react";

export default function CallToAction() {
  return (
    <div className="flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center">
        <div className="flex-1 justify-center flex flex-col">
            <h2 className="text-2xl">Want to learn more about go?</h2>
            <p className="text-gray-500 my-2">Checkout htese resuouce wiht 100 javasrcpt projects</p>
            <Button className="rounded-tl-xl rounded-bl-none">
                <a href="https://www.google.com/" target="_blank" rel="noopener noreferrer">Learn More</a>
            </Button>
        </div>
        <div className="p-7 flex-1">
            <img src="https://mott.pe/noticias/wp-content/uploads/2019/12/C%C3%B3mo-es-el-uso-de-l%C3%ADneas-horizontales-en-la-composici%C3%B3n-de-fotograf%C3%ADa.png"/>
        </div>
    </div>
  )
}
