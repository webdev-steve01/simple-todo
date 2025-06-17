import done from "../../public/done-ring-round-svgrepo-com.svg";
import trash from "../../public/trash-alt-svgrepo-com.svg";
import edit from "../../public/edit-1479-svgrepo-com.svg";
import style from "./card.module.css";
type todoElements = {
  title: string;
  desc: string;
  date: string;
};

function Card(prop: todoElements) {
  return (
    <div className={style.container}>
      <div className={style.cardBody}>
        <h2 className={style.title}>{prop.title}</h2>
        <p className={style.desc}>{prop.desc}</p>
        <p className={style.date}>
          Start Date : <span>{prop.date}</span>
        </p>
      </div>
      <div className={style.images}>
        <img src={done} alt="" />
        <img src={edit} alt="" />
        <img src={trash} alt="" />
      </div>
    </div>
  );
}

export default Card;
