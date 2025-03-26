import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
	redirectUrl: string;
	children: ReactNode;
}

const RedirectCell: FC<Props> = ({ redirectUrl, children }) => {
	return (
		<Link to={redirectUrl} className='decoration-opacity-50 hover:underline'>
			{children}
		</Link>
	);
};

export default RedirectCell;
