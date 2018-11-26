import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './card.css';

class Card extends Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        title: PropTypes.string.isRequired
    };

    render() {
        const { children, title } = this.props;

        if (!children || !title) {
            return null;
        }

        return (
            <div className = "card">
                <h1 className = "card__title">
                    { title }
                </h1>
                <div className = "card__content">
                    { children }
                </div>
            </div>
        );
    }
}

export default Card;
