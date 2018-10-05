import React from 'react';

import Typography from '@material-ui/core/Typography';
import '../../style/style.css';

function ContestDetails(props) {
    return(
        <div>
            <h1 className="error-title">Error 404</h1>
            <Typography className="notification-description" variant="subheading" color="textSecondary">
                <p className="error-text">{"The page you're looking for doesn't exist!"}</p>
            </Typography>
        </div>
    );
}

export default ContestDetails;