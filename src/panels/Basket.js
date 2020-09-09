import React, {useEffect, useMemo, useState} from 'react';
import { withRouter, Link } from 'react-router-dom';
import accounting from 'accounting';
import {useHistory} from "react-router-dom";
import Checkbox from './Checkbox';

import edit from '../img/edit.svg';
import './place.css';


const Basket = ({ match: { params: { areaId, itemId }}, foodAreas, order}) => {
    const history = useHistory();
    const [ faster, setFaster ] = useState(true);
    const [ time, setTime ] = useState('12:00');
    const [ selfService, setSelfService ] = useState(false);
    const area = foodAreas.filter(area => area.id === areaId)[0];
    const item = area.items.filter(item => item.id === itemId)[0];

    useEffect(() => {
        if(localStorage.SettingFaster){
            setFaster((localStorage.SettingFaster==='true' ? true : false));
        }
        if(localStorage.SettingselfService){
            setSelfService((localStorage.SettingselfService==='true' ? true : false));
        }
        if(localStorage.SettingTime){
            setTime(localStorage.SettingTime);
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('SettingFaster', faster);
        localStorage.setItem('SettingTime', time);
        localStorage.setItem('SettingselfService', selfService);
    }, [faster, time, selfService])

    const [ price, products ] = useMemo(() => {
        const foodIds = new Set((item.foods || []).map(item => item.id));

        const products = Object.values(order)
            .filter((value) => {
                const { item: { id }} = value;
                return foodIds.has(id);
            });

        const result = products.reduce((result, value) => {
            const { count, item } = value;
            return result + parseInt(item.price) * parseInt(count);
        }, 0);

        return [ accounting.formatNumber(result, 0, ' '), products ];
    }, [ order, item ]);

    const checkForms = (cb) => {
        if (!faster) {
            if (time === "") {
                alert("Вы не указали время к которому готовить Ваш заказ\n"+time)
            } else {
                let times = time.split(':');
                let hours = parseInt(times[0]);
                let minutes = parseInt(times[1]);
                if (!(hours >= 0 && hours <= 24) || !(minutes >= 0 && minutes <= 59)) {
                    alert("Вы указали неверное время для готовки заказа");
                    return false; //Неправильное время заказа
                } else {
                    return true; //Правильное время заказа
                }
            }

            //Узнаём с собой ли взял пользователь заказ TODO
        }

        if (cb) {
            cb()
        }
    }

    return (
        <div className="Place">
            <header className="Place__header">
                <aside className="Place__trz">
                    <h1 className="Place__head">
                        <Link to="/" className="Place__logo">
                            {area.name}
                        </Link>
                    </h1>
                    <Link to="/edit" className="Place__change-tz">
                        <img
                            alt="change-profile"
                            src={edit}
                        />
                    </Link>
                </aside>
            </header>
            <aside className="Place__restoraunt">
                <img
                    className="Place__restoraunt-logo"
                    alt="Fastfood logo"
                    src={item.image}
                />
                <h2
                    className="Place__restoraunt-name"
                >
                    {item.name}
                </h2>
                <p className="Place__restoraunt-type">
                    {item.description}
                </p>
            </aside>
            <div className="Place__products-wrapper">
                <ul className="Place__products">
                    {products.map(({ item, count }) => (
                        <li
                            className="Place__product"
                            key={item.id}
                        >
                            <img
                                className="Place__product-logo"
                                alt="Ordered product logo"
                                src={item.image}
                            />
                            <h3
                                className="Place__product-name"
                            >
                                {item.name}
                            </h3>
                            <p
                                className="Place__product-price"
                            >
                                Цена: {item.price}
                            </p>
                            <p
                                className="Place__product-count"
                            >
                                x{count}
                            </p>
                        </li>
                    ))}
                </ul>
                <Link
                    className="Place__change-product"
                    to={`/place/${areaId}/${itemId}`}
                >
                    Изменить
                </Link>
            </div>
            <div className="Place__choice">
                <h3>Время:</h3>
                <div className="Place__choice-item">
                    <span>Как можно быстрее</span>
                    <Checkbox
                        checked={faster}
                        onToggle={() => {
                            if (faster) {
                                setFaster(false);
                            } else {
                                setFaster(true);
                            }
                        }}
                    />
                </div>
                <div className="Place__choice-item">
                    <span>Назначить</span>
                    <input
                        value={time}
                        type="time"
                        maxLength={5}
                        onFocus={() => {
                            setFaster(false);
                        }}
                        onChange={event => {
                            setFaster(false);
                            setTime(event.target.value);
                        }}
                        onBlur={() => {
                            if (time) {
                                setFaster(false);
                            } else {
                                setFaster(true);
                            }
                        }}
                        disabled={faster}
                    />
                </div>
                <div className="Place__choice-item">
                    <h3>С собой</h3>
                    <Checkbox checked={selfService} onToggle={() => setSelfService(!selfService)} />
                </div>
                <div className="Place__choice-item">
                    <h3>На месте</h3>
                    <Checkbox checked={!selfService} onToggle={() => setSelfService(!selfService)} />
                </div>
            </div>
            <footer className="Place__footer">
                <Link onClick={()=>{checkForms(()=>{
                    history.push(`/order/${area.id}/${item.id}`);
                })}} className="Place__order">
                    Оплатить {price}
                </Link>
            </footer>
        </div>
    );
};

export default withRouter(Basket);
