// src/components/Footer.jsx

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-light py-4 mt-5">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>Контактная информация</h5>
                        <p>Телефон: +7 (777) 123-45-67</p>
                        <p>Email: academeg@autoparts.ru</p>
                    </Col>
                    <Col md={4}>
                        <h5>Адрес Самовывоза</h5>
                        <p>Город Москва, ул. Навального, д. 10, стр. 2</p>
                        <p>Пн-Пт: 9:00 - 20:00</p>
                        <p>Сб-Вс: 10:00 - 18:00</p>
                    </Col>
                    <Col md={4}>
                        <h5>О нас</h5>
                        <p>Мы специализируемся на продаже автозапчастей для широкого спектра автомобилей. Мы гарантируем качество и быструю доставку.</p>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col className="text-center text-muted">
                        © {new Date().getFullYear()} Auto Parts Shop. Все права защищены.
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
