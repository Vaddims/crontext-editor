
export interface AppTitleBarProps {
  children: React.ReactNode;
}

const AppTitleBar: React.FC<AppTitleBarProps> = (props) => {
  return (
    <div className='app title-bar'>
      <div className='controls'>
        {props.children}
      </div>
    </div>
  )
}

export default AppTitleBar;