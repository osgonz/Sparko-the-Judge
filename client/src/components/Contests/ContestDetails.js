import React, { Component } from 'react';

import Typography from '@material-ui/core/Typography';
import '../../style/style.css';

class ContestDetails extends Component {
    render()
    {
        return (
            <div>
                <h1 className="contest-title">Mi primer concurso</h1>
                <Typography className="notification-description" variant="subheading" color="textSecondary">
                    <p className="error-text">{"The page you're looking for doesn't exist!"}</p>
                </Typography>
            </div>
        );
    }
}

export default ContestDetails;