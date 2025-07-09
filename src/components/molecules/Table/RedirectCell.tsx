import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface Props {
	redirectUrl: string;
	children: ReactNode;
	allowRedirect?: boolean;
}

const RedirectCell: FC<Props> = ({ redirectUrl, children, allowRedirect = true }) => {
	if (!allowRedirect) {
		return <div>{children}</div>;
	}

	return (
		<Link to={redirectUrl} className='decoration-opacity-50 flex items-center gap-2 group'>
			{children}
			<ExternalLink className='w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity duration-200' />
		</Link>
	);
};

export default RedirectCell;
