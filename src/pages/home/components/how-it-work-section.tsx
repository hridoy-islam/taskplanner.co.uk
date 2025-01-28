import howItWorks from '../../../assets/imges/home/how_it_works.png';
import workTaskList from '../../../assets/imges/home/work_task_list.png';
export default function HowItWorkSection({ id }) {
  return (
    <section id="how-it-works" className=" py-24">
      <div className="container">
        <div className="">
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            <img src={howItWorks} width={561} height={500} alt="" />
            <img src={workTaskList} width={475} height={575} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}
